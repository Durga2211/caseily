import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..db import notifications_collection

router = APIRouter(prefix="/api", tags=["notifications"])

ADMIN_TOKEN = "caseily-admin-token-2024"
security = HTTPBearer(auto_error=False)

@router.get("/notifications")
async def get_notifications():
    """Public endpoint to get all active notifications"""
    if notifications_collection is None:
        return {"notifications": []}
        
    cursor = notifications_collection.find({}, {"_id": 0}).sort("created_at", -1)
    return {"notifications": list(cursor)}

@router.post("/admin/notifications")
async def create_notification(
    text: dict, 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not credentials or credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
        
    if notifications_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    new_notif = {
        "id": str(uuid.uuid4())[:8],
        "text": text.get("text", ""),
        "created_at": datetime.utcnow().isoformat()
    }
    
    notifications_collection.insert_one(new_notif)
    
    # Keep only the latest 20 notifications
    cursor = notifications_collection.find({}, {"id": 1}).sort("created_at", -1).skip(20)
    docs_to_delete = [doc["id"] for doc in cursor]
    if docs_to_delete:
        notifications_collection.delete_many({"id": {"$in": docs_to_delete}})
        
    new_notif.pop("_id", None)
    return {"status": "success", "notification": new_notif}

@router.delete("/admin/notifications/{notif_id}")
async def delete_notification(
    notif_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not credentials or credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
        
    if notifications_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    result = notifications_collection.delete_one({"id": notif_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    return {"status": "success"}
