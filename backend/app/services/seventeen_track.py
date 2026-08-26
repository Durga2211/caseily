import httpx
from app.core import config
async def register_tracking_number(tracking_number:str):
    url = f"{config.SEVENTEEN_TRACK_BASE_URL}/register"
    headers = {
        "17token" : config.SEVENTEEN_TRACK_API_KEY,
        "Content-Type" : "application/json"
    }
    payload = [
        {"number" : tracking_number}
    ]
    async with httpx.AsyncClient() as client:
        response = await client.post(url,json=payload,headers=headers)
        return response.json()

async def get_tracking_info(tracking_number:str):
    url = f"{config.SEVENTEEN_TRACK_BASE_URL}/gettrackinfo"
    headers = {
        "17token" : config.SEVENTEEN_TRACK_API_KEY,
        "Content-Type" : "applicaton/json"
    }
    payload = [
        {"number" : tracking_number}
    ]
    async with httpx.AsyncClient() as client:
        response = await client.post(url,json=payload,headers=headers)
        return response.json()

def normalise_tracking_data(raw_response : dict):
    print("DEBUG raw_response:",raw_response)
    accepted = raw_response.get("data",{}).get("accepted",[])
    if not accepted:
        return {"status":"not_found","steps": []}
    track_info = accepted[0].get("track_info",{})
    latest_status = track_info.get("latest_status",{})
    latest_event = track_info.get("latest_event",{})
    milestones = track_info.get("milestone",[])
    current_status = latest_status.get("status","unknown")
    status_order = ["InfoReceived","PickedUp","InTransit","OutForDelivery","Delivered"]
    print("DEBUG milestones:",milestones)
    stage_map = {
        "InfoReceived": "Order Placed",
        "PickedUp" : "Shipped",
        "InTransit" : "In Transit",
        "OutForDelivery" : "Out For Delivery",
        "Delivered" : "Delivered"
    }
    milestone_times={m["key_stage"]:m.get("time_iso") for m in milestones}
    current_index = status_order.index(current_status) if current_status in status_order else -1
    steps = []
    for i, key in enumerate(status_order):
        timestamp = milestone_times.get(key)
        if timestamp is None and i==current_index:
            timestamp = latest_event.get("time_iso")
        steps.append({
            "label" : stage_map[key],
            "timestamp" : timestamp,
            "done" : i<= current_index
        })
    # for m in milestones:
    #     label = stage_map.get(m["key_stage"])
    #     if label:
    #         steps.append({
    #             "label" : label,
    #             "timestamp" : m.get("time_iso"),
    #             "done" : i<=current_index
    #         })
    return {
        "status" : current_status,
        "steps" : steps
    }
