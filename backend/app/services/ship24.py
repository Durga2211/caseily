import httpx
from app.core import config

SHIP24_BASE_URL = "https://api.ship24.com/public/v1"

async def get_tracking_info(tracking_number: str):
    url = f"{SHIP24_BASE_URL}/trackers/track"
    headers = {
        "Authorization": f"Bearer {config.SHIP24_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"trackingNumber": tracking_number}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"error": str(e), "status_code": getattr(e.response, "status_code", 500)}

async def normalise_tracking_data(raw_response: dict, tracking_number: str):
    if "error" in raw_response or not raw_response.get("data", {}).get("trackings"):
        return {
            "status": "not_found", 
            "steps": [], 
            "courier_name": None, 
            "courier_tracking_url": None
        }
    
    trackings = raw_response["data"]["trackings"]
    if not trackings:
        return {
            "status": "not_found", 
            "steps": [], 
            "courier_name": None, 
            "courier_tracking_url": None
        }

    tracking_data = trackings[0]
    events = tracking_data.get("events", [])
    shipment = tracking_data.get("shipment", {})
    
    current_milestone = shipment.get("statusMilestone", "pending")
    courier = shipment.get("delivery", {}).get("courier", {}).get("name")
    
    milestone_order = ["info_received", "in_transit", "out_for_delivery", "delivered"]
    
    current_index = 0
    if current_milestone in milestone_order:
        current_index = milestone_order.index(current_milestone)
    elif current_milestone == "delivered":
        current_index = 3
    elif current_milestone == "exception":
        current_index = -1

    stage_map = {
        "info_received": "Order Placed",
        "in_transit": "In Transit",
        "out_for_delivery": "Out For Delivery",
        "delivered": "Delivered"
    }
    
    milestone_data = {}
    for event in events:
        m = event.get("statusMilestone")
        t = event.get("datetime") or event.get("eventTime")
        loc = event.get("location")
        if m and t:
            if m not in milestone_data:
                milestone_data[m] = {"timestamp": t, "location": loc}

    steps = []
    if events and current_index < 0 and current_milestone != "pending":
         current_index = 0
         
    for i, key in enumerate(milestone_order):
        data = milestone_data.get(key, {})
        timestamp = data.get("timestamp")
        location = data.get("location")
        steps.append({
            "label": stage_map[key], 
            "timestamp": timestamp,
            "location": location,
            "done": i <= current_index and bool(events)
        })
        
    return {
        "status": current_milestone.replace("_", " ").title(),
        "steps": steps,
        "courier_name": courier,
        "courier_tracking_url": None
    }

async def get_carriers() -> list[dict]:
    return [
        {"key": "usps", "name": "USPS", "country_iso": "US"},
        {"key": "fedex", "name": "FedEx", "country_iso": "US"},
        {"key": "ups", "name": "UPS", "country_iso": "US"},
        {"key": "dhl", "name": "DHL", "country_iso": "DE"},
        {"key": "china_post", "name": "China Post", "country_iso": "CN"}
    ]
