import os
import json
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api", tags=["notifications"])

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "notifications_db.json")

ADMIN_TOKEN = "caseily-admin-token-2024"
security = HTTPBearer(auto_error=False)

def _load_db():
    if not os.path.exists(DB_PATH):
        return []
    with open(DB_PATH, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def _save_db(data):
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=2)

@router.get("/notifications")
async def get_notifications():
    """Public endpoint to get all active notifications"""
    return {"notifications": _load_db()}

@router.post("/admin/notifications")
async def create_notification(
    text: dict, 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not credentials or credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
        
    db = _load_db()
    new_notif = {
        "id": str(uuid.uuid4())[:8],
        "text": text.get("text", ""),
        "created_at": datetime.utcnow().isoformat()
    }
    # Prepend new notification
    db.insert(0, new_notif)
    
    # Keep only the latest 20 notifications
    if len(db) > 20:
        db = db[:20]
        
    _save_db(db)
    return {"status": "success", "notification": new_notif}

@router.delete("/admin/notifications/{notif_id}")
async def delete_notification(
    notif_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not credentials or credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
        
    db = _load_db()
    new_db = [n for n in db if n.get("id") != notif_id]
    if len(new_db) == len(db):
        raise HTTPException(status_code=404, detail="Notification not found")
        
    _save_db(new_db)
    return {"status": "success"}
