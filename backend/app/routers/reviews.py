from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid
import os
import shutil
from datetime import datetime
from ..db import reviews_collection

router = APIRouter(prefix="/api", tags=["reviews"])

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

ADMIN_PASSWORD = "12345"
ADMIN_TOKEN = "caseily-admin-token-2024"

security = HTTPBearer(auto_error=False)

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
        try:
            from ..db import fs
            if fs is not None:
                fs.put(photo.file, filename=photo_filename, content_type=photo.content_type)
            else:
                photo_filename = None
        except Exception as e:
            photo_filename = None

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

    if reviews_collection is not None:
        reviews_collection.insert_one(review)
    
    # ensure it's JSON serializable when returning
    review.pop("_id", None)
    return {"success": True, "message": "Review submitted successfully!", "id": review_id}


@router.get("/reviews/approved")
async def get_approved_reviews():
    """Get all approved reviews (public)."""
    if reviews_collection is None:
        return {"reviews": []}
        
    cursor = reviews_collection.find({"status": "approved"}, {"_id": 0}).sort("created_at", -1)
    return {"reviews": list(cursor)}


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
    if reviews_collection is None:
        return {"reviews": []}
        
    # We want pending first, then sort by date
    pending = list(reviews_collection.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1))
    approved = list(reviews_collection.find({"status": "approved"}, {"_id": 0}).sort("created_at", -1))
    rejected = list(reviews_collection.find({"status": "rejected"}, {"_id": 0}).sort("created_at", -1))
    
    return {"reviews": pending + approved + rejected}


@router.post("/admin/reviews/{review_id}/approve")
async def approve_review(review_id: str, auth: bool = Depends(_require_admin)):
    """Approve a pending review."""
    if reviews_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    result = reviews_collection.update_one({"id": review_id}, {"$set": {"status": "approved"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"success": True, "message": "Review approved"}


@router.post("/admin/reviews/{review_id}/reject")
async def reject_review(review_id: str, auth: bool = Depends(_require_admin)):
    """Reject a pending review."""
    if reviews_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    result = reviews_collection.update_one({"id": review_id}, {"$set": {"status": "rejected"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"success": True, "message": "Review rejected"}

@router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, auth: bool = Depends(_require_admin)):
    """Delete a review."""
    if reviews_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    result = reviews_collection.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"success": True, "message": "Review deleted"}

