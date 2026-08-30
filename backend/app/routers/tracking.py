from fastapi import APIRouter, HTTPException
from typing import Optional
from app.services import ship24
import logging

logger = logging.getLogger("tracking")

router = APIRouter(prefix="/api", tags=["tracking"])

@router.get("/carriers")
async def list_carriers():
    carriers = await ship24.get_carriers()
    return {"carriers": carriers}

@router.get("/track")
async def track_order(tracking_number: str, carrier_code: Optional[str] = None):
    tracking_number = tracking_number.strip()
    if not tracking_number:
        raise HTTPException(status_code=400, detail="Tracking number is required")
    
    # Pass carrier_code to Ship24 so it doesn't rely on auto-detect
    carrier = carrier_code.strip() if carrier_code else None
    
    try:
        result = await ship24.track_shipment(tracking_number, courier_code=carrier)
        return result
    except Exception as e:
        logger.error("Tracking failed for %s: %s", tracking_number, e)
        raise HTTPException(
            status_code=502,
            detail="Failed to fetch tracking information. Please try again.",
        )