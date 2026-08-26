from fastapi import APIRouter
from typing import Optional
from app.services import seventeen_track

router = APIRouter(prefix="/api", tags=["tracking"])

@router.get("/carriers")
async def list_carriers():
    carriers = await seventeen_track.get_carriers()
    return {"carriers": carriers}

@router.get("/register-test")
async def register_test(tracking_number: str):
    result = await seventeen_track.register_tracking_number(tracking_number)
    return result

@router.get("/status-test")
async def status_test(tracking_number: str):
    result = await seventeen_track.get_tracking_info(tracking_number)
    return result

@router.get("/clean-test")
async def clean_test(tracking_number: str):
    raw = await seventeen_track.get_tracking_info(tracking_number)
    return await seventeen_track.normalise_tracking_data(raw, tracking_number)

@router.get("/track")
async def track_order(tracking_number: str, carrier_code: Optional[int] = None):
    raw = await seventeen_track.get_tracking_info(tracking_number)
    accepted = raw.get("data", {}).get("accepted", [])
    rejected = raw.get("data", {}).get("rejected", [])
    if not accepted and rejected:
        error_code = rejected[0].get("error", {}).get("code")
        if error_code == -18019902:
            await seventeen_track.register_tracking_number(tracking_number, carrier_code)
            raw = await seventeen_track.get_tracking_info(tracking_number)
    return await seventeen_track.normalise_tracking_data(raw, tracking_number)