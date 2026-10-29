from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import uuid
import io
import os
import time
from datetime import datetime
from ..db import reels_collection, fs

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

has_cloudinary = bool(CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET)
if has_cloudinary:
    try:
        import cloudinary
        import cloudinary.uploader
        import cloudinary.utils
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
            secure=True
        )
    except Exception as e:
        print(f"Warning: Cloudinary init failed: {e}")
        has_cloudinary = False

router = APIRouter(prefix="/api", tags=["reels"])

ADMIN_TOKEN = "caseily-admin-token-2024"
security = HTTPBearer(auto_error=False)

# Maximum video size: 100 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"}


def _require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


def _no_cache(response: Response):
    """Set no-cache headers to prevent stale data on Vercel CDN or browser caches."""
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"


class ReelMetadataCreate(BaseModel):
    caption: str
    video_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[float] = 0.0
    mime_type: Optional[str] = "video/mp4"
    storage_id: Optional[str] = None


class ReelReupload(BaseModel):
    video_url: str
    thumbnail_url: Optional[str] = None
    storage_id: Optional[str] = None
    duration: Optional[float] = 0.0
    mime_type: Optional[str] = "video/mp4"


# ─── Public endpoints ────────────────────────────────────────────────────

@router.get("/reels")
async def get_reels(response: Response):
    """Return all active published reels sorted by newest first. Excludes missing reels."""
    _no_cache(response)

    if reels_collection is None:
        return {"reels": []}

    # Hide reels with status='missing' from the public site
    query = {"status": {"$ne": "missing"}}
    reels = list(reels_collection.find(query, {"_id": 0}).sort("created_at", -1))
    return {"reels": reels}


# ─── Admin endpoints ─────────────────────────────────────────────────────

@router.get("/admin/reels")
async def get_admin_reels(response: Response, _auth: bool = Depends(_require_admin)):
    """Return all reels including missing ones so admin can manage and re-upload."""
    _no_cache(response)

    if reels_collection is None:
        return {"reels": []}

    reels = list(reels_collection.find({}, {"_id": 0}).sort("created_at", -1))
    return {"reels": reels}


@router.get("/admin/reels/upload-signature")
async def get_upload_signature(_auth: bool = Depends(_require_admin)):
    """
    Generate signature for direct client-to-Cloudinary upload.
    This allows large video files to bypass Vercel's 4.5MB request limit.
    """
    if not has_cloudinary:
        return {
            "configured": False,
            "provider": "none",
            "message": "Cloudinary credentials not configured in backend .env. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
        }

    timestamp = int(time.time())
    folder = "caseily/reels"
    params_to_sign = {
        "folder": folder,
        "timestamp": timestamp,
    }
    signature = cloudinary.utils.api_sign_request(params_to_sign, CLOUDINARY_API_SECRET)

    return {
        "configured": True,
        "provider": "cloudinary",
        "cloud_name": CLOUDINARY_CLOUD_NAME,
        "api_key": CLOUDINARY_API_KEY,
        "timestamp": timestamp,
        "signature": signature,
        "folder": folder,
    }


@router.post("/admin/reels")
async def create_reel(
    request: Request,
    _auth: bool = Depends(_require_admin),
):
    """
    Create a new reel.
    Accepts either JSON payload (after direct client-side upload to Cloudinary/storage)
    OR multipart/form-data with a video file (fallback).
    """
    if reels_collection is None:
        raise HTTPException(status_code=503, detail="Database not available")

    content_type = request.headers.get("content-type", "")

    # 1. JSON Payload: Client-side upload completed directly to persistent storage
    if "application/json" in content_type:
        body = await request.json()
        caption = body.get("caption", "").strip()
        video_url = body.get("video_url", "").strip()
        thumbnail_url = body.get("thumbnail_url", "")
        duration = body.get("duration", 0.0)
        mime_type = body.get("mime_type", "video/mp4")
        storage_id = body.get("storage_id")

        if not video_url:
            raise HTTPException(status_code=400, detail="video_url is required")
        if not caption:
            raise HTTPException(status_code=400, detail="caption is required")

        reel_id = str(uuid.uuid4())[:8]

        # Auto-generate thumbnail URL if not provided and Cloudinary URL
        if not thumbnail_url and "cloudinary.com" in video_url:
            thumbnail_url = video_url.rsplit(".", 1)[0] + ".jpg"
            if "/video/upload/" in thumbnail_url:
                thumbnail_url = thumbnail_url.replace(
                    "/video/upload/",
                    "/video/upload/so_0,f_jpg,q_auto,w_720/"
                )

        reel = {
            "id": reel_id,
            "caption": caption,
            "video_url": video_url,
            "thumbnail_url": thumbnail_url,
            "video": video_url,  # Backwards compatibility
            "storage_id": storage_id,
            "duration": duration,
            "mime_type": mime_type,
            "likes": 0,
            "comments": [],
            "status": "published",
            "created_at": datetime.utcnow().isoformat(),
        }
        reels_collection.insert_one(reel)
        reel.pop("_id", None)
        return {"message": "Reel published successfully", "reel": reel}

    # 2. Multipart form fallback: Direct video upload via server
    form = await request.form()
    caption = form.get("caption", "").strip()
    video: UploadFile = form.get("video")

    if not video or not video.filename:
        raise HTTPException(status_code=400, detail="Video file is required")
    if not caption:
        raise HTTPException(status_code=400, detail="Caption is required")

    video_bytes = await video.read()
    if len(video_bytes) > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Video file too large. Maximum size is {MAX_VIDEO_SIZE // (1024*1024)}MB"
        )

    reel_id = str(uuid.uuid4())[:8]
    ext = (video.filename or "video.mp4").rsplit(".", 1)[-1].lower()

    video_url = None
    thumbnail_url = None
    storage_id = None
    duration = 0.0

    # If Cloudinary is available, upload directly to Cloudinary
    if has_cloudinary:
        try:
            res = cloudinary.uploader.upload(
                io.BytesIO(video_bytes),
                resource_type="video",
                folder="caseily/reels",
                public_id=f"reel_{reel_id}",
                transformation=[{"quality": "auto", "fetch_format": "auto"}]
            )
            video_url = res.get("secure_url")
            storage_id = res.get("public_id")
            duration = res.get("duration", 0.0)
            thumbnail_url = video_url.rsplit(".", 1)[0] + ".jpg"
            if "/video/upload/" in thumbnail_url:
                thumbnail_url = thumbnail_url.replace(
                    "/video/upload/",
                    "/video/upload/so_0,f_jpg,q_auto,w_720/"
                )
        except Exception as e:
            print(f"Cloudinary upload error in fallback: {e}")

    # Fallback to GridFS if Cloudinary is not configured or failed
    if not video_url:
        if fs is not None:
            gridfs_filename = f"reels/{reel_id}.{ext}"
            fs.put(
                io.BytesIO(video_bytes),
                filename=gridfs_filename,
                content_type=video.content_type or "video/mp4",
                reel_id=reel_id,
            )
            video_url = gridfs_filename
        else:
            raise HTTPException(status_code=500, detail="No storage provider available")

    reel = {
        "id": reel_id,
        "caption": caption,
        "video_url": video_url,
        "thumbnail_url": thumbnail_url,
        "video": video_url,
        "storage_id": storage_id,
        "duration": duration,
        "mime_type": video.content_type or "video/mp4",
        "likes": 0,
        "comments": [],
        "status": "published",
        "created_at": datetime.utcnow().isoformat(),
    }
    reels_collection.insert_one(reel)
    reel.pop("_id", None)
    return {"message": "Reel uploaded successfully", "reel": reel}


@router.put("/admin/reels/{reel_id}/reupload")
async def reupload_reel_video(
    reel_id: str,
    payload: ReelReupload,
    _auth: bool = Depends(_require_admin),
):
    """
    Replace the video file on an existing reel record.
    Keeps caption, creation date, likes, and comments intact, and sets status='published'.
    """
    if reels_collection is None:
        raise HTTPException(status_code=503, detail="Database not available")

    existing = reels_collection.find_one({"id": reel_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Reel not found")

    thumbnail_url = payload.thumbnail_url
    if not thumbnail_url and "cloudinary.com" in payload.video_url:
        thumbnail_url = payload.video_url.rsplit(".", 1)[0] + ".jpg"
        if "/video/upload/" in thumbnail_url:
            thumbnail_url = thumbnail_url.replace(
                "/video/upload/",
                "/video/upload/so_0,f_jpg,q_auto,w_720/"
            )

    update_fields = {
        "video_url": payload.video_url,
        "video": payload.video_url,
        "thumbnail_url": thumbnail_url,
        "storage_id": payload.storage_id,
        "duration": payload.duration,
        "mime_type": payload.mime_type or "video/mp4",
        "status": "published",
        "updated_at": datetime.utcnow().isoformat(),
    }

    reels_collection.update_one({"id": reel_id}, {"$set": update_fields})
    updated = reels_collection.find_one({"id": reel_id}, {"_id": 0})
    return {"message": "Video re-uploaded successfully", "reel": updated}


@router.delete("/admin/reels/{reel_id}")
async def delete_reel(
    reel_id: str,
    _auth: bool = Depends(_require_admin),
):
    """Delete a reel: remove from MongoDB and delete cloud storage asset."""
    if reels_collection is None:
        raise HTTPException(status_code=503, detail="Database not available")

    reel = reels_collection.find_one({"id": reel_id})
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    # 1. Delete from Cloudinary if storage_id exists
    storage_id = reel.get("storage_id")
    if storage_id and has_cloudinary:
        try:
            cloudinary.uploader.destroy(storage_id, resource_type="video")
        except Exception as e:
            print(f"Cloudinary delete warning for {storage_id}: {e}")

    # 2. Delete from GridFS if filename was used
    vid_file = reel.get("video", "")
    if fs is not None and vid_file and vid_file.startswith("reels/"):
        try:
            while True:
                grid_file = fs.get_last_version(filename=vid_file)
                fs.delete(grid_file._id)
        except Exception:
            pass

    # 3. Delete metadata from MongoDB
    reels_collection.delete_one({"id": reel_id})

    return {"message": "Reel deleted successfully"}


# ─── Public interaction endpoints ────────────────────────────────────

@router.post("/reels/{reel_id}/like")
async def toggle_like(reel_id: str):
    """Increment like on a reel and return updated count."""
    if reels_collection is None:
        return {"likes": 0}

    result = reels_collection.find_one_and_update(
        {"id": reel_id},
        {"$inc": {"likes": 1}},
        return_document=True,
        projection={"_id": 0, "likes": 1},
    )

    if not result:
        reels_collection.insert_one({
            "id": reel_id,
            "likes": 1,
            "comments": [],
            "status": "published",
            "is_stub": True,
            "created_at": datetime.utcnow().isoformat(),
        })
        return {"likes": 1}

    return {"likes": result.get("likes", 0)}


@router.post("/reels/{reel_id}/comment")
async def add_comment(reel_id: str, body: dict):
    """Add a comment to a reel."""
    if reels_collection is None:
        raise HTTPException(status_code=503, detail="Database not available")

    comment = {
        "id": str(uuid.uuid4())[:8],
        "name": body.get("name", "Anonymous").strip() or "Anonymous",
        "text": body.get("text", "").strip(),
        "created_at": datetime.utcnow().isoformat(),
    }

    if not comment["text"]:
        raise HTTPException(status_code=400, detail="Comment text cannot be empty")

    result = reels_collection.find_one_and_update(
        {"id": reel_id},
        {"$push": {"comments": comment}},
        return_document=True,
        projection={"_id": 0, "comments": 1},
    )

    if not result:
        reels_collection.insert_one({
            "id": reel_id,
            "likes": 0,
            "comments": [comment],
            "status": "published",
            "is_stub": True,
            "created_at": datetime.utcnow().isoformat(),
        })
        return {"comment": comment, "total_comments": 1}

    return {"comment": comment, "total_comments": len(result.get("comments", []))}


@router.get("/reels/{reel_id}/comments")
async def get_comments(reel_id: str, response: Response):
    """Get all comments for a reel."""
    _no_cache(response)

    if reels_collection is None:
        return {"comments": []}

    reel = reels_collection.find_one({"id": reel_id}, {"_id": 0, "comments": 1})
    if not reel:
        return {"comments": []}

    return {"comments": reel.get("comments", [])}
