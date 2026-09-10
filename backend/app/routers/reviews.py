from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import uuid
import os
import shutil
from datetime import datetime

router = APIRouter(prefix="/api", tags=["reviews"])

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reviews_db.json")
SEED_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reviews_seed.json")
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

ADMIN_PASSWORD = "12345"
ADMIN_TOKEN = "caseily-admin-token-2024"

security = HTTPBearer(auto_error=False)

# ─── In-memory store ─────────────────────────────────────────────────────
# This ensures reviews survive Render's ephemeral filesystem restarts.
# On cold start, we load from reviews_db.json (which is committed to Git),
# merge in any seed data, and keep everything in memory for the lifetime
# of the process. Writes also go to disk as best-effort backup.
_reviews_store = None

def _init_store():
    """Initialize the in-memory store from disk files on first access."""
    global _reviews_store
    if _reviews_store is not None:
        return

    reviews = []

    # Load from seed file first (committed, never changes at runtime)
    if os.path.exists(SEED_PATH):
        try:
            with open(SEED_PATH, "r") as f:
                reviews = json.load(f)
        except (json.JSONDecodeError, IOError):
            reviews = []

    # Then load from runtime DB and merge any new reviews
    if os.path.exists(DB_PATH):
        try:
            with open(DB_PATH, "r") as f:
                db_reviews = json.load(f)
            existing_ids = {r["id"] for r in reviews}
            for r in db_reviews:
                if r["id"] not in existing_ids:
                    reviews.append(r)
        except (json.JSONDecodeError, IOError):
            pass

    _reviews_store = reviews
    # Write merged result back to disk
    _save_to_disk()


def _get_reviews():
    """Get the in-memory reviews list."""
    _init_store()
    return _reviews_store

def _set_reviews(data):
    """Update the in-memory store and persist to disk."""
    global _reviews_store
    _reviews_store = data
    _save_to_disk()

def _save_to_disk():
    """Best-effort write to disk."""
    try:
        with open(DB_PATH, "w") as f:
            json.dump(_reviews_store, f, indent=2, default=str)
    except IOError:
        pass  # On read-only filesystems, silently continue

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
        try:
            with open(photo_path, "wb") as f:
                shutil.copyfileobj(photo.file, f)
        except IOError:
            photo_filename = None  # Skip photo on read-only fs

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

    reviews = _get_reviews()
    reviews.append(review)
    _set_reviews(reviews)

    return {"success": True, "message": "Review submitted successfully!", "id": review_id}


@router.get("/reviews/approved")
async def get_approved_reviews():
    """Get all approved reviews (public)."""
    reviews = _get_reviews()
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
    reviews = list(_get_reviews())  # copy to avoid mutating
    # Sort: pending first, then by date descending
    reviews.sort(key=lambda r: (0 if r.get("status") == "pending" else 1, r.get("created_at", "")), reverse=False)
    return {"reviews": reviews}


@router.post("/admin/reviews/{review_id}/approve")
async def approve_review(review_id: str, auth: bool = Depends(_require_admin)):
    """Approve a pending review."""
    reviews = _get_reviews()
    for r in reviews:
        if r["id"] == review_id:
            r["status"] = "approved"
            _set_reviews(reviews)
            return {"success": True, "message": "Review approved"}
    raise HTTPException(status_code=404, detail="Review not found")


@router.post("/admin/reviews/{review_id}/reject")
async def reject_review(review_id: str, auth: bool = Depends(_require_admin)):
    """Reject a pending review."""
    reviews = _get_reviews()
    for r in reviews:
        if r["id"] == review_id:
            r["status"] = "rejected"
            _set_reviews(reviews)
            return {"success": True, "message": "Review rejected"}
    raise HTTPException(status_code=404, detail="Review not found")

@router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, auth: bool = Depends(_require_admin)):
    """Delete a review."""
    reviews = _get_reviews()
    filtered_reviews = [r for r in reviews if r["id"] != review_id]
    if len(filtered_reviews) == len(reviews):
        raise HTTPException(status_code=404, detail="Review not found")
    _set_reviews(filtered_reviews)
    return {"success": True, "message": "Review deleted"}
