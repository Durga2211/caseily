import httpx
import asyncio
import logging
import re
from app.core import config

logger = logging.getLogger("ship24")

SHIP24_BASE_URL = "https://api.ship24.com/public/v1"

# ── Known courier patterns for auto-suggestion ──────────────────────────
# Ship24 auto-detect can misfire for some formats. These regex→slug
# mappings let us pass an explicit courierCode when the tracking number
# format is recognisable.
COURIER_PATTERNS: list[tuple[re.Pattern, str, str]] = [
    # Delhivery — typically 10-14 digit numeric
    (re.compile(r"^\d{10,14}$"), "delhivery", "Delhivery"),
    # BlueDart — usually starts with digits, 8-11 chars
    (re.compile(r"^\d{8,11}$"), "bluedart", "BlueDart"),
    # India Post / Speed Post — 13 chars starting with E/R/C + 2-letter country
    (re.compile(r"^[A-Z]{2}\d{9}[A-Z]{2}$"), "indiapost", "India Post"),
    # DTDC — alphanumeric, often starts with a letter
    (re.compile(r"^[A-Z]\d{8,}$"), "dtdc", "DTDC"),
    # Ekart — typically starts with FMPP or OD
    (re.compile(r"^(FMPP|OD)\d+", re.IGNORECASE), "ekart", "Ekart Logistics"),
]

# ── Retry configuration ─────────────────────────────────────────────────
# Ship24 needs time to poll the courier after tracker creation.
# 6 attempts × 10s = up to ~60 seconds, which is usually enough.
MAX_POLL_RETRIES = 6
POLL_INTERVAL_SECONDS = 10


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {config.SHIP24_API_KEY}",
        "Content-Type": "application/json",
    }


def _guess_courier(tracking_number: str) -> str | None:
    """Try to match a tracking number against known courier formats.
    Returns the Ship24 courier slug, or None if no match."""
    for pattern, slug, name in COURIER_PATTERNS:
        if pattern.match(tracking_number):
            logger.info("Auto-matched tracking %s to courier %s (%s)",
                        tracking_number, slug, name)
            return slug
    return None


# ── Step 1: Create a tracker ─────────────────────────────────────────────
async def create_tracker(
    tracking_number: str,
    courier_code: str | None = None,
) -> dict:
    """Register a tracking number with Ship24 via POST /trackers.
    
    If courier_code is provided, it's sent as courierCode[] so Ship24
    doesn't rely on auto-detection.  If not provided, we try to guess
    from the tracking number format; if that also fails, Ship24's
    auto-detect is used (with a logged warning).
    """
    url = f"{SHIP24_BASE_URL}/trackers"

    # Build payload
    payload: dict = {"trackingNumber": tracking_number}

    # Resolve courier code: explicit > guessed > auto-detect
    resolved_courier = courier_code or _guess_courier(tracking_number)
    used_auto_detect = resolved_courier is None
    if resolved_courier:
        payload["courierCode"] = [resolved_courier]
        logger.info("Creating tracker for %s with courier %s (explicit=%s)",
                     tracking_number, resolved_courier, bool(courier_code))
    else:
        logger.warning(
            "No courierCode provided or guessed for tracking %s — "
            "relying on Ship24 auto-detection (may be inaccurate).",
            tracking_number,
        )
    payload["_used_auto_detect"] = used_auto_detect  # internal flag, stripped before send

    # Strip internal flags before sending to Ship24
    send_payload = {k: v for k, v in payload.items() if not k.startswith("_")}
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(url, json=send_payload, headers=_headers())
            resp.raise_for_status()
            data = resp.json()
            tracker_id = (
                data.get("data", {})
                .get("tracker", {})
                .get("trackerId")
            )
            if not tracker_id:
                logger.error("Ship24 returned no trackerId: %s", data)
                return {"error": "Ship24 did not return a tracker ID", "raw": data}
            logger.info("Tracker created: %s", tracker_id)
            return {"trackerId": tracker_id, "raw": data, "used_auto_detect": payload.get("_used_auto_detect", True)}
        except httpx.HTTPStatusError as e:
            # If 409 or similar, tracker may already exist — try to extract ID
            body = {}
            try:
                body = e.response.json()
            except Exception:
                pass
            # Ship24 returns existing tracker on duplicate
            existing_id = (
                body.get("data", {})
                .get("tracker", {})
                .get("trackerId")
            )
            if existing_id:
                logger.info("Tracker already exists: %s", existing_id)
                return {"trackerId": existing_id, "raw": body, "used_auto_detect": payload.get("_used_auto_detect", True)}
            logger.error("Ship24 tracker creation failed: %s %s",
                         e.response.status_code, body)
            return {
                "error": f"Ship24 error {e.response.status_code}",
                "status_code": e.response.status_code,
                "raw": body,
            }
        except httpx.HTTPError as e:
            logger.error("Ship24 request error: %s", e)
            return {"error": str(e)}


# ── Step 2: Fetch tracker results ────────────────────────────────────────
async def get_tracker_results(tracker_id: str) -> dict:
    """Fetch tracking results for an existing tracker via
    GET /trackers/{trackerId}/results."""
    url = f"{SHIP24_BASE_URL}/trackers/{tracker_id}/results"

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get(url, headers=_headers())
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            body = {}
            try:
                body = e.response.json()
            except Exception:
                pass
            logger.error("Ship24 results fetch failed: %s %s",
                         e.response.status_code, body)
            return {
                "error": f"Ship24 error {e.response.status_code}",
                "status_code": e.response.status_code,
                "raw": body,
            }
        except httpx.HTTPError as e:
            logger.error("Ship24 request error: %s", e)
            return {"error": str(e)}


# ── Orchestrator: create → poll → normalise ──────────────────────────────
async def track_shipment(
    tracking_number: str,
    courier_code: str | None = None,
) -> dict:
    """Full tracking flow:
    1. Create (or re-use) a tracker
    2. Poll for results with retries
    3. Normalise and return
    """
    # Step 1 — create tracker
    creation = await create_tracker(tracking_number, courier_code)
    if "error" in creation:
        return {
            "status": "error",
            "status_tag": "error",
            "message": creation["error"],
            "steps": [],
            "courier_name": None,
            "courier_tracking_url": None,
        }

    tracker_id = creation["trackerId"]
    used_auto_detect = creation.get("used_auto_detect", True)

    # Step 2 — poll for results with retries
    raw_results = None
    for attempt in range(1, MAX_POLL_RETRIES + 1):
        raw_results = await get_tracker_results(tracker_id)
        if "error" in raw_results:
            return {
                "status": "error",
                "status_tag": "error",
                "message": raw_results["error"],
                "steps": [],
                "courier_name": None,
                "courier_tracking_url": None,
            }

        # Check if we have actual tracking data
        trackings = raw_results.get("data", {}).get("trackings", [])
        if trackings and trackings[0].get("events"):
            logger.info("Got %d events on attempt %d",
                        len(trackings[0]["events"]), attempt)
            break

        if attempt < MAX_POLL_RETRIES:
            logger.info(
                "No events yet for %s (attempt %d/%d), retrying in %ds…",
                tracking_number, attempt, MAX_POLL_RETRIES,
                POLL_INTERVAL_SECONDS,
            )
            await asyncio.sleep(POLL_INTERVAL_SECONDS)

    # Step 3 — normalise
    return normalise_tracking_data(raw_results, tracking_number, used_auto_detect=used_auto_detect)


# ── Response normaliser ──────────────────────────────────────────────────
def normalise_tracking_data(raw_response: dict, tracking_number: str, used_auto_detect: bool = True) -> dict:
    """Parse Ship24's response into a flat structure for the frontend.
    
    Ship24 response shape (POST /trackers/track or GET /trackers/{id}/results):
        data.trackings[]: array of tracking objects
            .tracker: { trackerId, trackingNumber, ... }
            .shipment: { shipmentId, statusMilestone, ... }
            .events[]: [{ eventId, status, occurrenceDatetime,
                          statusMilestone, location, ... }]
    """
    if "error" in raw_response:
        return {
            "status": "Error",
            "status_tag": "error",
            "message": raw_response.get("error", "Unknown error"),
            "steps": [],
            "courier_name": None,
            "courier_tracking_url": None,
        }

    trackings = raw_response.get("data", {}).get("trackings", [])

    # No tracking data at all → not found
    if not trackings:
        return {
            "status": "Not Found",
            "status_tag": "not_found",
            "message": "No tracking information found for this number.",
            "steps": [],
            "courier_name": None,
            "courier_tracking_url": None,
        }

    tracking_data = trackings[0]
    events = tracking_data.get("events") or []
    shipment = tracking_data.get("shipment") or {}
    tracker = tracking_data.get("tracker") or {}

    # ── Current milestone from shipment level ────────────────────────
    current_milestone = shipment.get("statusMilestone")

    # ── Courier info from tracker (not shipment) ─────────────────────
    courier_name = None
    courier_codes = tracker.get("courierCode") or []
    if courier_codes:
        courier_name = courier_codes[0]  # slug; we'll prettify below

    # ── No events yet? Ship24 created tracker but hasn't polled ──────
    if not events:
        msg = (
            "Tracking info not yet available — the courier hasn't "
            "reported any updates yet. Please check back in a few minutes."
        )
        if used_auto_detect:
            msg += (
                " Tip: try selecting your courier from the dropdown above "
                "for more accurate results."
            )
        return {
            "status": "Awaiting Update",
            "status_tag": "awaiting",
            "message": msg,
            "steps": _empty_steps(),
            "courier_name": courier_name,
            "courier_tracking_url": None,
        }

    # ── Milestone ordering ───────────────────────────────────────────
    milestone_order = ["info_received", "in_transit", "out_for_delivery", "delivered"]

    stage_labels = {
        "info_received": "Order Placed",
        "in_transit": "In Transit",
        "out_for_delivery": "Out For Delivery",
        "delivered": "Delivered",
    }

    # Determine current index
    current_index = -1
    if current_milestone in milestone_order:
        current_index = milestone_order.index(current_milestone)
    elif current_milestone == "exception":
        current_index = -1  # special handling below

    # ── Collect first timestamp / location for each milestone ────────
    milestone_data: dict[str, dict] = {}
    for event in events:
        m = event.get("statusMilestone")
        # Ship24 uses "occurrenceDatetime", NOT "datetime"
        t = event.get("occurrenceDatetime") or event.get("datetime")
        loc = event.get("location")
        if m and m not in milestone_data:
            milestone_data[m] = {"timestamp": t, "location": loc}

    # If we have events but couldn't resolve current_index, use the
    # highest milestone found in events
    if current_index < 0 and events:
        for i, key in reversed(list(enumerate(milestone_order))):
            if key in milestone_data:
                current_index = i
                current_milestone = key
                break
        if current_index < 0:
            current_index = 0  # fallback: at least "info_received"

    # ── Build steps ──────────────────────────────────────────────────
    steps = []
    for i, key in enumerate(milestone_order):
        data = milestone_data.get(key, {})
        timestamp = data.get("timestamp")
        location = data.get("location")
        done = i <= current_index
        steps.append({
            "label": stage_labels[key],
            "timestamp": timestamp,
            "location": location,
            "done": done,
        })

    # ── Determine status tag for frontend styling ────────────────────
    status_tag_map = {
        "info_received": "info",
        "in_transit": "transit",
        "out_for_delivery": "transit",
        "delivered": "delivered",
        "exception": "exception",
    }
    status_tag = status_tag_map.get(current_milestone, "transit")

    # ── Human-readable status ────────────────────────────────────────
    display_status = stage_labels.get(
        current_milestone,
        (current_milestone or "Unknown").replace("_", " ").title(),
    )
    if current_milestone == "exception":
        display_status = "Exception"

    return {
        "status": display_status,
        "status_tag": status_tag,
        "message": None,
        "steps": steps,
        "courier_name": courier_name,
        "courier_tracking_url": None,
    }


def _empty_steps() -> list[dict]:
    """Return the 4 milestone steps with nothing marked done."""
    labels = ["Order Placed", "In Transit", "Out For Delivery", "Delivered"]
    return [
        {"label": label, "timestamp": None, "location": None, "done": False}
        for label in labels
    ]


# ── Carrier list ─────────────────────────────────────────────────────────
async def get_carriers() -> list[dict]:
    """Fetch available couriers from Ship24 with a hardcoded fallback."""
    url = f"{SHIP24_BASE_URL}/couriers"
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(url, headers=_headers())
            resp.raise_for_status()
            couriers_raw = resp.json().get("data", {}).get("couriers", [])
            return [
                {
                    "key": c.get("courierCode", ""),
                    "name": c.get("courierName", c.get("courierCode", "")),
                    "country_iso": c.get("courierHomepageUrl", ""),
                }
                for c in couriers_raw[:50]  # limit for dropdown perf
            ]
        except Exception as e:
            logger.warning("Failed to fetch couriers from Ship24: %s — using fallback", e)

    # Fallback list
    return [
        {"key": "delhivery", "name": "Delhivery", "country_iso": "IN"},
        {"key": "bluedart", "name": "BlueDart", "country_iso": "IN"},
        {"key": "indiapost", "name": "India Post", "country_iso": "IN"},
        {"key": "dtdc", "name": "DTDC", "country_iso": "IN"},
        {"key": "ekart", "name": "Ekart Logistics", "country_iso": "IN"},
        {"key": "usps", "name": "USPS", "country_iso": "US"},
        {"key": "fedex", "name": "FedEx", "country_iso": "US"},
        {"key": "ups", "name": "UPS", "country_iso": "US"},
        {"key": "dhl", "name": "DHL", "country_iso": "DE"},
        {"key": "china-post", "name": "China Post", "country_iso": "CN"},
    ]
