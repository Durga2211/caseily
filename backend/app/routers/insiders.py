from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import uuid
import os
import shutil
from datetime import datetime

router = APIRouter(prefix="/api", tags=["insiders"])

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "insiders_db.json")
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

ADMIN_TOKEN = "caseily-admin-token-2024"
security = HTTPBearer(auto_error=False)

# ─── DB helpers ──────────────────────────────────────────────────────────
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
        json.dump(data, f, indent=2, default=str)

def _require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# ─── Public endpoints ────────────────────────────────────────────────────

@router.get("/insiders")
async def get_insider_posts():
    """Get all insider posts."""
    posts = _load_db()
    # Sort by created_at descending
    posts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {"posts": posts}


@router.post("/insiders/{post_id}/like")
async def like_post(post_id: str):
    """Like a post."""
    posts = _load_db()
    for post in posts:
        if post["id"] == post_id:
            post["likes"] = post.get("likes", 0) + 1
            _save_db(posts)
            return {"success": True, "likes": post["likes"]}
    raise HTTPException(status_code=404, detail="Post not found")

@router.post("/insiders/{post_id}/comment")
async def add_comment(post_id: str, request: Request):
    """Add a comment to a post."""
    data = await request.json()
    text = data.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Missing comment text")
        
    posts = _load_db()
    for post in posts:
        if post["id"] == post_id:
            if "comments" not in post:
                post["comments"] = []
            new_comment = {
                "id": str(uuid.uuid4())[:8],
                "text": str(text).strip(),
                "created_at": datetime.now().isoformat(),
                "author": "User" # hardcoded for now since no auth
            }
            post["comments"].append(new_comment)
            _save_db(posts)
            return {"success": True, "comment": new_comment}
    raise HTTPException(status_code=404, detail="Post not found")


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
                img_path = os.path.join(UPLOADS_DIR, img_filename)
                with open(img_path, "wb") as f:
                    shutil.copyfileobj(img.file, f)
                image_filenames.append(img_filename)
            
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

    posts = _load_db()
    posts.append(post)
    _save_db(posts)

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
                img_path = os.path.join(UPLOADS_DIR, img_filename)
                with open(img_path, "wb") as f:
                    shutil.copyfileobj(img.file, f)
                image_filenames.append(img_filename)
            
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

    posts = _load_db()
    posts.append(post)
    _save_db(posts)

    return {"success": True, "message": "Post created successfully!", "post": post}


@router.delete("/admin/insiders/{post_id}")
async def delete_insider_post(post_id: str, auth: bool = Depends(_require_admin)):
    """Delete a post (Admin only)."""
    posts = _load_db()
    filtered = [p for p in posts if p["id"] != post_id]
    if len(filtered) == len(posts):
        raise HTTPException(status_code=404, detail="Post not found")
        
    _save_db(filtered)
    return {"success": True, "message": "Post deleted successfully!"}
