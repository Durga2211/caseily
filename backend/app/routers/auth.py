from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.db import users_collection
import uuid

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    phone: str
    password: str

class UserLogin(BaseModel):
    phone: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    phone: str
    created_at: str

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate):
    # Check if user exists
    existing_user = users_collection.find_one({"phone": user.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
        
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "name": user.name,
        "phone": user.phone,
        # In a real app we'd hash the password here (e.g. bcrypt)
        # For simplicity/demo we'll store it as provided
        "password": user.password,
        "created_at": datetime.now().isoformat()
    }
    
    users_collection.insert_one(new_user)
    
    return UserResponse(
        id=user_id,
        name=user.name,
        phone=user.phone,
        created_at=new_user["created_at"]
    )

@router.post("/login", response_model=UserResponse)
async def login(user: UserLogin):
    db_user = users_collection.find_one({"phone": user.phone})
    
    if not db_user or db_user.get("password") != user.password:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
        
    return UserResponse(
        id=db_user["id"],
        name=db_user["name"],
        phone=db_user["phone"],
        created_at=db_user["created_at"]
    )

@router.get("/users", response_model=List[UserResponse])
async def get_users():
    if users_collection is None:
        return []
    users = []
    try:
        cursor = users_collection.find().sort("created_at", -1)
        for doc in cursor:
            users.append(
                UserResponse(
                    id=str(doc.get("id", doc.get("_id", ""))),
                    name=doc.get("name", "Unknown"),
                    phone=doc.get("phone", "Unknown"),
                    created_at=doc.get("created_at", "")
                )
            )
    except Exception as e:
        print(f"Error fetching users: {e}")
    return users
