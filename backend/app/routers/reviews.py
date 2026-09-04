from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import uuid
import os
import shutil
from datetime import datetime

router = APIRouter(prefix="/api", tags=["reviews"])

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reviews_db.json")
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

ADMIN_PASSWORD = "12345"
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

@router.post("/reviews")
async def submit_review(
    name: str = Form(...),
    city: str = Form(""),
    stars: int = Form(5),
    quote: str = Form(...),
    photo: UploadFile = File(None),
):
    """Submit a new customer review with optional photo."""
    review_id = str(uuid.uuid4())[:8]
    photo_filename = None

    if photo and photo.filename:
        ext = os.path.splitext(photo.filename)[1] or ".png"
        photo_filename = f"review_{review_id}{ext}"
        photo_path = os.path.join(UPLOADS_DIR, photo_filename)
        with open(photo_path, "wb") as f:
            shutil.copyfileobj(photo.file, f)

    review = {
        "id": review_id,
        "name": name.strip(),
        "city": city.strip(),
        "stars": max(1, min(5, stars)),
        "quote": quote.strip(),
        "photo": photo_filename,
        "status": "pending",  # pending | approved | rejected
        "created_at": datetime.now().isoformat(),
    }

    reviews = _load_db()
    reviews.append(review)
    _save_db(reviews)

    return {"success": True, "message": "Review submitted successfully!", "id": review_id}


@router.get("/reviews/approved")
async def get_approved_reviews():
    """Get all approved reviews (public)."""
    reviews = _load_db()
    approved = [r for r in reviews if r.get("status") == "approved"]
    return {"reviews": approved}


# ─── Admin endpoints ─────────────────────────────────────────────────────

@router.post("/admin/login")
async def admin_login(password: str = Form(...)):
    """Validate admin password and return token."""
    if password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"success": True, "token": ADMIN_TOKEN}


@router.get("/admin/reviews")
async def get_all_reviews(auth: bool = Depends(_require_admin)):
    """Get all reviews for admin (pending first)."""
    reviews = _load_db()
    # Sort: pending first, then by date descending
    reviews.sort(key=lambda r: (0 if r.get("status") == "pending" else 1, r.get("created_at", "")), reverse=False)
    return {"reviews": reviews}


@router.post("/admin/reviews/{review_id}/approve")
async def approve_review(review_id: str, auth: bool = Depends(_require_admin)):
    """Approve a pending review."""
    reviews = _load_db()
    for r in reviews:
        if r["id"] == review_id:
            r["status"] = "approved"
            _save_db(reviews)
            return {"success": True, "message": "Review approved"}
    raise HTTPException(status_code=404, detail="Review not found")


@router.post("/admin/reviews/{review_id}/reject")
async def reject_review(review_id: str, auth: bool = Depends(_require_admin)):
    """Reject a pending review."""
    reviews = _load_db()
    for r in reviews:
        if r["id"] == review_id:
            r["status"] = "rejected"
            _save_db(reviews)
            return {"success": True, "message": "Review rejected"}
    raise HTTPException(status_code=404, detail="Review not found")
