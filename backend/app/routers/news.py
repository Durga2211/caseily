from fastapi import APIRouter, HTTPException, Depends, Form, UploadFile, File
from pydantic import BaseModel
import uuid
import json
import os
from datetime import datetime
from ..db import news_collection
from .reviews import _require_admin

router = APIRouter(prefix="/api", tags=["news"])

LOCAL_DB_FILE = "news_db.json"

def get_local_db():
    if os.path.exists(LOCAL_DB_FILE):
        try:
            with open(LOCAL_DB_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_local_db(data):
    with open(LOCAL_DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

@router.get("/news")
async def get_all_news():
    if news_collection is not None:
        cursor = news_collection.find({}, {"_id": 0}).sort("created_at", -1)
        return {"news": list(cursor)}
    else:
        news_list = get_local_db()
        news_list.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"news": news_list}

@router.post("/admin/news")
async def create_news(
    title: str = Form(...),
    category: str = Form(...),
    content: str = Form(...),
    color: str = Form("#3b82f6"),
    photo: UploadFile = File(None),
    auth: bool = Depends(_require_admin)
):
    news_id = str(uuid.uuid4())[:8]
    
    photo_filename = None
    if photo and photo.filename:
        ext = os.path.splitext(photo.filename)[1] or ".png"
        photo_filename = f"news_{news_id}{ext}"
        try:
            from ..db import fs
            if fs is not None:
                fs.put(photo.file, filename=photo_filename, content_type=photo.content_type)
            else:
                photo_filename = None
        except Exception as e:
            photo_filename = None

    article = {
        "id": news_id,
        "title": title.strip(),
        "category": category.strip(),
        "content": content.strip(),
        "color": color,
        "photo": photo_filename,
        "likes": 0,
        "comments": [],
        "created_at": datetime.now().isoformat()
    }
    
    if news_collection is not None:
        news_collection.insert_one(article)
    else:
        news_list = get_local_db()
        news_list.append(article)
        save_local_db(news_list)
        
    article.pop("_id", None)
    return {"success": True, "message": "Article created successfully", "article": article}

@router.delete("/admin/news/{news_id}")
async def delete_news(news_id: str, auth: bool = Depends(_require_admin)):
    if news_collection is not None:
        result = news_collection.delete_one({"id": news_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Article not found")
    else:
        news_list = get_local_db()
        new_list = [a for a in news_list if a.get("id") != news_id]
        if len(new_list) == len(news_list):
            raise HTTPException(status_code=404, detail="Article not found")
        save_local_db(new_list)
        
    return {"success": True}

@router.post("/news/{news_id}/like")
async def like_news(news_id: str):
    if news_collection is not None:
        result = news_collection.update_one({"id": news_id}, {"$inc": {"likes": 1}})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Article not found")
    else:
        news_list = get_local_db()
        found = False
        for a in news_list:
            if a.get("id") == news_id:
                a["likes"] = a.get("likes", 0) + 1
                found = True
                break
        if not found:
            raise HTTPException(status_code=404, detail="Article not found")
        save_local_db(news_list)
        
    return {"success": True}

class CommentModel(BaseModel):
    text: str
    username: str

@router.post("/news/{news_id}/comment")
async def comment_news(news_id: str, payload: CommentModel):
    comment = {
        "id": str(uuid.uuid4())[:8],
        "text": payload.text.strip(),
        "username": payload.username.strip(),
        "created_at": datetime.now().isoformat()
    }
    
    if news_collection is not None:
        result = news_collection.update_one({"id": news_id}, {"$push": {"comments": comment}})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Article not found")
    else:
        news_list = get_local_db()
        found = False
        for a in news_list:
            if a.get("id") == news_id:
                if "comments" not in a:
                    a["comments"] = []
                a["comments"].append(comment)
                found = True
                break
        if not found:
            raise HTTPException(status_code=404, detail="Article not found")
        save_local_db(news_list)
        
    return {"success": True, "comment": comment}
