from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
import uuid
import os
from datetime import datetime
from ..db import insiders_collection, fs

router = APIRouter(prefix="/api", tags=["insiders"])

ADMIN_TOKEN = "caseily-admin-token-2024"
security = HTTPBearer(auto_error=False)


def _require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# ─── Public endpoints ────────────────────────────────────────────────────

@router.get("/insiders")
async def get_insider_posts():
    """Get all insider posts."""
    if insiders_collection is None:
        return {"posts": []}
    cursor = insiders_collection.find({}, {"_id": 0}).sort("created_at", -1)
    return {"posts": list(cursor)}


@router.post("/insiders/{post_id}/like")
async def like_post(post_id: str):
    """Like a post."""
    if insiders_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    result = insiders_collection.find_one_and_update(
        {"id": post_id},
        {"$inc": {"likes": 1}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True, "likes": result["likes"]}

@router.post("/insiders/{post_id}/comment")
async def add_comment(post_id: str, request: Request):
    """Add a comment to a post."""
    data = await request.json()
    text = data.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Missing comment text")
        
    if insiders_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    new_comment = {
        "id": str(uuid.uuid4())[:8],
        "text": str(text).strip(),
        "created_at": datetime.now().isoformat(),
        "author": "User" # hardcoded for now since no auth
    }
    
    result = insiders_collection.update_one(
        {"id": post_id},
        {"$push": {"comments": new_comment}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True, "comment": new_comment}


@router.post("/insiders")
async def public_create_insider_post(
    post_type: str = Form(...), # "text", "image"
    content: str = Form(...),
    images: List[UploadFile] = File(None),
):
    """Create a new Insider post (Public)."""
    if post_type not in ["text", "image"]:
        raise HTTPException(status_code=400, detail="Invalid post type")

    post_id = str(uuid.uuid4())[:8]
    image_filenames = []

    if images:
        for i, img in enumerate(images):
            if img and img.filename:
                ext = os.path.splitext(img.filename)[1] or ".png"
                img_filename = f"insider_{post_id}_{i}{ext}"
                try:
                    if fs is not None:
                        fs.put(img.file, filename=img_filename, content_type=img.content_type)
                        image_filenames.append(img_filename)
                except Exception:
                    pass
            
    post = {
        "id": post_id,
        "type": post_type,
        "author": "User", # public user
        "content": content.strip(),
        "images": image_filenames,
        "created_at": datetime.now().isoformat(),
        "likes": 0,
        "comments": []
    }

    if insiders_collection is not None:
        insiders_collection.insert_one(post)
    post.pop("_id", None)

    return {"success": True, "message": "Post created successfully!", "post": post}


# ─── Admin endpoints ─────────────────────────────────────────────────────

@router.post("/admin/insiders")
async def create_insider_post(
    auth: bool = Depends(_require_admin),
    post_type: str = Form(...), # "text", "image"
    content: str = Form(...),
    images: List[UploadFile] = File(None),
):
    """Create a new Insider post (Admin only)."""
    if post_type not in ["text", "image"]:
        raise HTTPException(status_code=400, detail="Invalid post type")

    post_id = str(uuid.uuid4())[:8]
    image_filenames = []

    if images:
        for i, img in enumerate(images):
            if img and img.filename:
                ext = os.path.splitext(img.filename)[1] or ".png"
                img_filename = f"insider_{post_id}_{i}{ext}"
                try:
                    if fs is not None:
                        fs.put(img.file, filename=img_filename, content_type=img.content_type)
                        image_filenames.append(img_filename)
                except Exception:
                    pass
            
    post = {
        "id": post_id,
        "type": post_type,
        "author": "Admin",
        "content": content.strip(),
        "images": image_filenames, # array of filenames
        "created_at": datetime.now().isoformat(),
        "likes": 0,
        "comments": []
    }

    if insiders_collection is not None:
        insiders_collection.insert_one(post)
    post.pop("_id", None)

    return {"success": True, "message": "Post created successfully!", "post": post}


@router.delete("/admin/insiders/{post_id}")
async def delete_insider_post(post_id: str, auth: bool = Depends(_require_admin)):
    """Delete a post (Admin only)."""
    if insiders_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    result = insiders_collection.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
        
    return {"success": True, "message": "Post deleted successfully!"}
