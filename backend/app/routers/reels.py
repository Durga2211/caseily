from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
import uuid
import io
from datetime import datetime
from ..db import reels_collection, fs

router = APIRouter(prefix="/api", tags=["reels"])

ADMIN_TOKEN = "caseily-admin-token-2024"
security = HTTPBearer(auto_error=False)

# Maximum video size: 50 MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"}


def _require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


def _no_cache(response: Response):
    """Set no-cache headers to prevent stale data on Vercel CDN."""
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"


# ─── Public endpoints ────────────────────────────────────────────────────

@router.get("/reels")
async def get_reels(response: Response):
    """Return all reels sorted by newest first. No caching so new reels appear instantly."""
    _no_cache(response)

    if reels_collection is None:
        return {"reels": []}

    reels = list(reels_collection.find({}, {"_id": 0}).sort("created_at", -1))
    return {"reels": reels}


# ─── Admin endpoints ─────────────────────────────────────────────────────

@router.post("/admin/reels")
async def create_reel(
    caption: str = Form(...),
    video: UploadFile = File(...),
    _auth: bool = Depends(_require_admin),
):
    """Upload a new reel video to GridFS with metadata in MongoDB."""
    if reels_collection is None or fs is None:
        raise HTTPException(status_code=503, detail="Database not available")

    # Validate file type
    content_type = video.content_type or ""
    if not content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video files are allowed")

    # Read entire file into memory and validate size
    video_bytes = await video.read()
    if len(video_bytes) > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Video file too large. Maximum size is {MAX_VIDEO_SIZE // (1024*1024)}MB"
        )

    reel_id = str(uuid.uuid4())[:8]
    ext = (video.filename or "video.mp4").rsplit(".", 1)[-1] if "." in (video.filename or "") else "mp4"
    gridfs_filename = f"reels/{reel_id}.{ext}"

    # Store video in GridFS
    fs.put(
        io.BytesIO(video_bytes),
        filename=gridfs_filename,
        content_type=content_type,
        reel_id=reel_id,
    )

    # Store metadata in MongoDB
    reel = {
        "id": reel_id,
        "caption": caption,
        "video": gridfs_filename,
        "created_at": datetime.utcnow().isoformat(),
        "likes": 0,
        "comments": [],
        "status": "published",
    }
    reels_collection.insert_one(reel)

    # Return without _id (MongoDB internal field)
    reel.pop("_id", None)
    return {"message": "Reel uploaded successfully", "reel": reel}


@router.delete("/admin/reels/{reel_id}")
async def delete_reel(
    reel_id: str,
    _auth: bool = Depends(_require_admin),
):
    """Delete a reel: remove from MongoDB and GridFS."""
    if reels_collection is None or fs is None:
        raise HTTPException(status_code=503, detail="Database not available")

    reel = reels_collection.find_one({"id": reel_id})
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    # Delete video from GridFS (may have multiple versions)
    gridfs_filename = reel.get("video", "")
    if gridfs_filename:
        try:
            while True:
                grid_file = fs.get_last_version(filename=gridfs_filename)
                fs.delete(grid_file._id)
        except Exception:
            pass  # No more versions to delete

    # Delete metadata from MongoDB
    reels_collection.delete_one({"id": reel_id})

    return {"message": "Reel deleted successfully"}


# ─── Public interaction endpoints ────────────────────────────────────

@router.post("/reels/{reel_id}/like")
async def toggle_like(reel_id: str):
    """Toggle like on a reel and return updated count."""
    if reels_collection is None:
        return {"likes": 0}

    result = reels_collection.find_one_and_update(
        {"id": reel_id},
        {"$inc": {"likes": 1}},
        return_document=True,
        projection={"_id": 0, "likes": 1},
    )

    if not result:
        # Create a stub for unknown reels (e.g. local promos)
        reels_collection.insert_one({
            "id": reel_id,
            "likes": 1,
            "comments": [],
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
        "name": body.get("name", "Anonymous"),
        "text": body.get("text", ""),
        "created_at": datetime.utcnow().isoformat(),
    }

    result = reels_collection.find_one_and_update(
        {"id": reel_id},
        {"$push": {"comments": comment}},
        return_document=True,
        projection={"_id": 0, "comments": 1},
    )

    if not result:
        # Create a stub for unknown reels
        reels_collection.insert_one({
            "id": reel_id,
            "likes": 0,
            "comments": [comment],
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
