import httpx
from app.core import config

# 17TRACK statuses that mean "we don't have a real live update for this"
NO_LIVE_DATA_STATUSES = {"NotFound", "notfound", "Exception", "Expired", "unknown"}

# Fill in / expand as you hit specific couriers. Key = 17TRACK carrier name, lowercased.
COURIER_TRACKING_URLS = {
    "akash ganga courier": "https://akashganga.in/track?awb={awb}",   # verify actual path on their site
    "india post": "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx",
    "delhivery": "https://www.delhivery.com/track-v2/package/{awb}",
    "bluedart": "https://www.bluedart.com/tracking",
    "dtdc": "https://www.dtdc.in/tracking.asp",
}

_carrier_map_cache: dict[int, str] | None = None
_carrier_map_raw_cache: list[dict] | None = None

async def _get_carrier_map() -> dict[int, str]:
    """17TRACK publishes a static JSON mapping carrier code -> name. Fetch once, cache in memory."""
    global _carrier_map_cache
    if _carrier_map_cache is not None:
        return _carrier_map_cache
    raw = await _get_carrier_map_raw()
    _carrier_map_cache = {item["key"]: item["_name"] for item in raw}
    return _carrier_map_cache



async def get_carriers() -> list[dict]:
    """Return a cleaned list of carriers for the frontend picker."""
    carrier_map_raw = await _get_carrier_map_raw()
    carriers = []
    for item in carrier_map_raw:
        carriers.append({
            "key": item["key"],
            "name": item["_name"],
            "country_iso": item.get("_country_iso", ""),
        })
    # Sort alphabetically by name
    carriers.sort(key=lambda c: c["name"].strip().lower())
    return carriers


async def _get_carrier_map_raw() -> list[dict]:
    """Fetch and cache the raw carrier list from 17track."""
    global _carrier_map_raw_cache
    if _carrier_map_raw_cache is not None:
        return _carrier_map_raw_cache
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://res.17track.net/asset/carrier/info/carrier.all.json")
        _carrier_map_raw_cache = resp.json()
    return _carrier_map_raw_cache


async def register_tracking_number(tracking_number: str, carrier_code: int | None = None):
    url = f"{config.SEVENTEEN_TRACK_BASE_URL}/register"
    headers = {"17token": config.SEVENTEEN_TRACK_API_KEY, "Content-Type": "application/json"}
    entry: dict = {"number": tracking_number}
    if carrier_code is not None:
        entry["carrier"] = carrier_code
    payload = [entry]
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        return response.json()


async def get_tracking_info(tracking_number: str):
    url = f"{config.SEVENTEEN_TRACK_BASE_URL}/gettrackinfo"
    headers = {"17token": config.SEVENTEEN_TRACK_API_KEY, "Content-Type": "application/json"}
    payload = [{"number": tracking_number}]
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        return response.json()


def _get_courier_tracking_url(courier_name: str | None, tracking_number: str) -> str | None:
    if not courier_name:
        return None
    template = COURIER_TRACKING_URLS.get(courier_name.strip().lower())
    if not template:
        return None
    return template.format(awb=tracking_number) if "{awb}" in template else template


async def normalise_tracking_data(raw_response: dict, tracking_number: str):
    accepted = raw_response.get("data", {}).get("accepted", [])
    if not accepted:
        return {"status": "not_found", "steps": [], "courier_name": None, "courier_tracking_url": None}

    item = accepted[0]

    # resolve carrier code -> name
    carrier_code = item.get("carrier")
    courier_name = None
    if carrier_code:
        carrier_map = await _get_carrier_map()
        courier_name = carrier_map.get(carrier_code)

    track_info = item.get("track_info", {})
    latest_status = track_info.get("latest_status", {})
    latest_event = track_info.get("latest_event", {})
    milestones = track_info.get("milestone", [])
    current_status = latest_status.get("status", "unknown")

    status_order = ["InfoReceived", "PickedUp", "InTransit", "OutForDelivery", "Delivered"]
    stage_map = {
        "InfoReceived": "Order Placed", "PickedUp": "Shipped", "InTransit": "In Transit",
        "OutForDelivery": "Out For Delivery", "Delivered": "Delivered",
    }
    milestone_times = {m["key_stage"]: m.get("time_iso") for m in milestones}
    current_index = status_order.index(current_status) if current_status in status_order else -1

    steps = []
    for i, key in enumerate(status_order):
        timestamp = milestone_times.get(key)
        if timestamp is None and i == current_index:
            timestamp = latest_event.get("time_iso")
        steps.append({"label": stage_map[key], "timestamp": timestamp, "done": i <= current_index})

    result = {"status": current_status, "steps": steps, "courier_name": courier_name}

    if current_status in NO_LIVE_DATA_STATUSES:
        result["courier_tracking_url"] = _get_courier_tracking_url(courier_name, tracking_number)
    else:
        result["courier_tracking_url"] = None

    return result