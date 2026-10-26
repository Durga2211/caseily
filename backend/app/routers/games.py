from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

router = APIRouter(prefix="/api/games", tags=["games"])

class ConnectionManager:
    def __init__(self):
        # room_code -> { "clients": [ws1, ws2], "state": {} }
        self.rooms = {}

    async def connect(self, websocket: WebSocket, room_code: str):
        await websocket.accept()
        if room_code not in self.rooms:
            self.rooms[room_code] = {"clients": [], "state": {}}
        
        if len(self.rooms[room_code]["clients"]) >= 2:
            await websocket.send_json({"type": "error", "message": "Room is full"})
            await websocket.close()
            return False

        self.rooms[room_code]["clients"].append(websocket)
        return True

    def disconnect(self, websocket: WebSocket, room_code: str):
        if room_code in self.rooms:
            if websocket in self.rooms[room_code]["clients"]:
                self.rooms[room_code]["clients"].remove(websocket)
            if not self.rooms[room_code]["clients"]:
                del self.rooms[room_code]

    async def broadcast(self, room_code: str, message: dict):
        if room_code in self.rooms:
            # We copy the list to avoid issues if a client disconnects during broadcast
            for client in list(self.rooms[room_code]["clients"]):
                try:
                    await client.send_json(message)
                except:
                    pass

manager = ConnectionManager()

@router.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    connected = await manager.connect(websocket, room_code)
    if not connected:
        return
    
    clients_count = len(manager.rooms[room_code]["clients"])
    player_num = clients_count # 1 for host, 2 for guest
    
    await websocket.send_json({
        "type": "init", 
        "player": player_num, 
        "state": manager.rooms[room_code]["state"]
    })
    await manager.broadcast(room_code, {"type": "player_joined", "count": clients_count})

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            msg_type = message.get("type")
            if msg_type == "state_update":
                manager.rooms[room_code]["state"] = message.get("state")
                await manager.broadcast(room_code, {
                    "type": "state_update", 
                    "state": manager.rooms[room_code]["state"], 
                    "sender": player_num
                })
            elif msg_type == "action":
                await manager.broadcast(room_code, {
                    "type": "action", 
                    "action": message.get("action"), 
                    "sender": player_num
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_code)
        # Notify remaining players
        remaining = len(manager.rooms.get(room_code, {"clients": []})["clients"])
        await manager.broadcast(room_code, {"type": "player_left", "count": remaining})
