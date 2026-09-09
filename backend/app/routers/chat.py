import os
import json
import uuid
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from typing import List, Dict

router = APIRouter(prefix="/api/chat", tags=["chat"])

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chat_db.json")
REACTIONS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chat_reactions_db.json")

def load_chat():
    if not os.path.exists(DB_PATH):
        return []
    with open(DB_PATH, "r") as f:
        try:
            return json.load(f)
        except:
            return []

def save_chat(data):
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=2)

def load_reactions():
    if not os.path.exists(REACTIONS_PATH):
        return []
    with open(REACTIONS_PATH, "r") as f:
        try:
            return json.load(f)
        except:
            return []

def save_reactions(data):
    with open(REACTIONS_PATH, "w") as f:
        json.dump(data, f, indent=2)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send history (last 100 messages)
        history = load_chat()[-100:]
        await websocket.send_json({"type": "history", "data": history})

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "message":
                msg_payload = {
                    "id": str(uuid.uuid4())[:8],
                    "user": data.get("user", "Anonymous"),
                    "text": data.get("text", ""),
                    "avatar": data.get("avatar", "U"),
                    "color": data.get("color", "#1e3fd1"),
                    "timestamp": datetime.utcnow().isoformat()
                }
                chat_data = load_chat()
                chat_data.append(msg_payload)
                if len(chat_data) > 1000:
                    chat_data = chat_data[-1000:]
                save_chat(chat_data)
                await manager.broadcast({"type": "message", "data": msg_payload})
                
            elif data.get("type") == "reaction":
                await manager.broadcast({
                    "type": "reaction",
                    "emoji": data.get("emoji", "❤️")
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# HTTP Fallback endpoints for serverless environments (like Vercel)
@router.get("/messages")
async def get_messages():
    history = load_chat()[-100:]
    reactions = load_reactions()
    # clear reactions after they are fetched to simulate ephemerality
    save_reactions([])
    return {"messages": history, "reactions": reactions}

@router.post("/message")
async def post_message(request: Request):
    data = await request.json()
    msg_payload = {
        "id": str(uuid.uuid4())[:8],
        "user": data.get("user", "Anonymous"),
        "text": data.get("text", ""),
        "avatar": data.get("avatar", "U"),
        "color": data.get("color", "#1e3fd1"),
        "timestamp": datetime.utcnow().isoformat()
    }
    chat_data = load_chat()
    chat_data.append(msg_payload)
    if len(chat_data) > 1000:
        chat_data = chat_data[-1000:]
    save_chat(chat_data)
    
    # Broadcast to any active WS connections as well
    await manager.broadcast({"type": "message", "data": msg_payload})
    return {"status": "ok", "message": msg_payload}

@router.post("/reaction")
async def post_reaction(request: Request):
    data = await request.json()
    reaction = {"id": str(uuid.uuid4())[:8], "emoji": data.get("emoji", "❤️")}
    
    reactions = load_reactions()
    reactions.append(reaction)
    # keep only last 50 unread reactions
    if len(reactions) > 50:
        reactions = reactions[-50:]
    save_reactions(reactions)
    
    # Broadcast to any active WS connections as well
    await manager.broadcast({
        "type": "reaction",
        "emoji": reaction["emoji"]
    })
    return {"status": "ok"}
