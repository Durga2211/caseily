from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import uuid
import os
import shutil
from datetime import datetime

router = APIRouter(prefix="/api", tags=["reels"])

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reels_db.json")
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "reels")

ADMIN_TOKEN = "caseily-admin-token-2024"
security = HTTPBearer(auto_error=False)

os.makedirs(UPLOADS_DIR, exist_ok=True)

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

@router.get("/reels")
async def get_reels():
    """Return all reels sorted by newest first."""
    reels = _load_db()
    reels.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return {"reels": reels}

# ─── Admin endpoints ─────────────────────────────────────────────────────

@router.post("/admin/reels")
async def create_reel(
    caption: str = Form(...),
    video: UploadFile = File(...),
    _auth: bool = Depends(_require_admin),
):
    """Upload a new reel video with caption."""
    # Validate file type
    if not video.content_type or not video.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video files are allowed")

    reel_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(video.filename or "video.mp4")[1] or ".mp4"
    filename = f"{reel_id}{ext}"
    filepath = os.path.join(UPLOADS_DIR, filename)

    with open(filepath, "wb") as f:
        shutil.copyfileobj(video.file, f)

    reel = {
        "id": reel_id,
        "caption": caption,
        "video": f"reels/{filename}",
        "created_at": datetime.utcnow().isoformat(),
    }

    reels = _load_db()
    reels.append(reel)
    _save_db(reels)

    return {"message": "Reel uploaded successfully", "reel": reel}


@router.delete("/admin/reels/{reel_id}")
async def delete_reel(
    reel_id: str,
    _auth: bool = Depends(_require_admin),
):
    """Delete a reel by ID."""
    reels = _load_db()
    reel = next((r for r in reels if r["id"] == reel_id), None)
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    # Delete video file
    filepath = os.path.join(os.path.dirname(UPLOADS_DIR), reel["video"])
    if os.path.exists(filepath):
        os.remove(filepath)

    reels = [r for r in reels if r["id"] != reel_id]
    _save_db(reels)

    return {"message": "Reel deleted successfully"}
