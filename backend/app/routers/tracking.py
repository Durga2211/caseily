from fastapi import APIRouter
from typing import Optional
from app.services import ship24

router = APIRouter(prefix="/api", tags=["tracking"])

@router.get("/carriers")
async def list_carriers():
    carriers = await ship24.get_carriers()
    return {"carriers": carriers}

@router.get("/track")
async def track_order(tracking_number: str, carrier_code: Optional[str] = None):
    tracking_number = tracking_number.strip()
    # Ship24 handles auto-detection, carrier_code is usually optional
    raw = await ship24.get_tracking_info(tracking_number)
    return await ship24.normalise_tracking_data(raw, tracking_number)