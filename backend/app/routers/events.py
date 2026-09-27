from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.db import events_collection, stage_messages_collection
import uuid
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()

ADMIN_TOKEN = "caseily-admin-token-2024"
security = HTTPBearer(auto_error=False)

def _require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

class EventBase(BaseModel):
    title: str
    description: str
    date: str
    time: str
    location: str
    video_url: Optional[str] = None
    banner_url: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: str
    created_at: str

@router.get("/events", response_model=List[EventResponse])
async def get_events():
    if events_collection is None:
        return []
    cursor = events_collection.find().sort("created_at", -1)
    events = []
    for doc in cursor:
        events.append(
            EventResponse(
                id=doc.get("id"),
                title=doc.get("title", ""),
                description=doc.get("description", ""),
                date=doc.get("date", ""),
                time=doc.get("time", ""),
                location=doc.get("location", ""),
                video_url=doc.get("video_url"),
                banner_url=doc.get("banner_url"),
                created_at=doc.get("created_at", "")
            )
        )
    return events

@router.post("/admin/events", response_model=EventResponse)
async def create_event(event: EventCreate, _=Depends(_require_admin)):
    if events_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    event_id = str(uuid.uuid4())[:8]
    new_event = {
        "id": event_id,
        "title": event.title,
        "description": event.description,
        "date": event.date,
        "time": event.time,
        "location": event.location,
        "video_url": event.video_url,
        "banner_url": event.banner_url,
        "created_at": datetime.now().isoformat()
    }
    events_collection.insert_one(new_event)
    return EventResponse(**new_event)

@router.delete("/admin/events/{event_id}")
async def delete_event(event_id: str, _=Depends(_require_admin)):
    if events_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    result = events_collection.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"success": True}

class StageMessage(BaseModel):
    author: str
    content: str

@router.get("/events/{event_id}/messages")
async def get_stage_messages(event_id: str):
    if stage_messages_collection is None:
        return {"messages": []}
    cursor = stage_messages_collection.find({"event_id": event_id}).sort("created_at", 1)
    messages = []
    for doc in cursor:
        messages.append({
            "id": doc.get("id"),
            "author": doc.get("author"),
            "content": doc.get("content"),
            "created_at": doc.get("created_at")
        })
    return {"messages": messages}

@router.post("/events/{event_id}/messages")
async def add_stage_message(event_id: str, message: StageMessage):
    if stage_messages_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    msg_id = str(uuid.uuid4())[:8]
    new_msg = {
        "id": msg_id,
        "event_id": event_id,
        "author": message.author,
        "content": message.content,
        "created_at": datetime.now().isoformat()
    }
    stage_messages_collection.insert_one(new_msg)
    return new_msg
