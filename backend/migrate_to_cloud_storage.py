"""
Migration and Recovery Script for Caseily Reels
- Finds all reels in MongoDB
- Checks if video files exist locally or in GridFS
- If Cloudinary credentials exist, uploads them to persistent Cloudinary storage and sets public video_url and thumbnail_url
- If video files do NOT exist, marks record as status="missing"
- Reports exactly which reels are recovered vs missing
"""

import os
import sys
import io
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from pymongo import MongoClient
import gridfs

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("ERROR: MONGO_URI not found in environment.")
    sys.exit(1)

client = MongoClient(MONGO_URI)
db = client.get_database("caseily")
reels_col = db["reels"]
fs = gridfs.GridFS(db)

# Check Cloudinary config
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

has_cloudinary = bool(CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET)
if has_cloudinary:
    import cloudinary
    import cloudinary.uploader
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True
    )
    print(f"✓ Cloudinary configured for cloud: {CLOUDINARY_CLOUD_NAME}")
else:
    print("ℹ Cloudinary not yet configured in .env (will verify local/GridFS files without cloud upload)")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_UPLOADS = os.path.join(BASE_DIR, "uploads")

recovered = []
missing = []
promos = []

print("\n--- Scanning MongoDB Reels ---")
for r in reels_col.find():
    reel_id = r.get("id")
    caption = r.get("caption", "No Caption")
    created_at = r.get("created_at", "")
    is_promo = r.get("is_local_promo", False)
    vid = r.get("video", "")
    video_url = r.get("video_url", "")
    status = r.get("status", "published")

    if is_promo:
        promos.append({"id": reel_id, "caption": caption, "video": vid})
        continue

    # Already has a persistent public HTTPS URL
    if video_url and (video_url.startswith("https://") or video_url.startswith("http://")):
        print(f"✓ Reel {reel_id} already has persistent URL: {video_url[:50]}...")
        recovered.append({"id": reel_id, "caption": caption, "video_url": video_url})
        continue

    # Check local disk
    local_path = os.path.join(LOCAL_UPLOADS, vid)
    file_bytes = None
    if os.path.exists(local_path) and os.path.isfile(local_path):
        with open(local_path, "rb") as f:
            file_bytes = f.read()
        print(f"✓ Reel {reel_id} found on local disk: {local_path} ({len(file_bytes)} bytes)")
    else:
        # Check GridFS
        try:
            gf = fs.get_last_version(filename=vid)
            file_bytes = gf.read()
            print(f"✓ Reel {reel_id} found in GridFS: {vid} ({len(file_bytes)} bytes)")
        except Exception:
            file_bytes = None

    if file_bytes:
        # File is found and recovered!
        if has_cloudinary:
            print(f"  Uploading {reel_id} to Cloudinary...")
            try:
                res = cloudinary.uploader.upload(
                    io.BytesIO(file_bytes),
                    resource_type="video",
                    folder="caseily/reels",
                    public_id=f"reel_{reel_id}",
                    overwrite=True,
                    transformation=[{"quality": "auto", "fetch_format": "auto"}]
                )
                cloud_video_url = res.get("secure_url")
                storage_id = res.get("public_id")
                # Auto-generate thumbnail URL
                cloud_thumb_url = cloud_video_url.rsplit(".", 1)[0] + ".jpg"
                if "/video/upload/" in cloud_thumb_url:
                    cloud_thumb_url = cloud_thumb_url.replace(
                        "/video/upload/",
                        "/video/upload/so_0,f_jpg,q_auto,w_720/"
                    )

                reels_col.update_one(
                    {"id": reel_id},
                    {"$set": {
                        "video_url": cloud_video_url,
                        "thumbnail_url": cloud_thumb_url,
                        "storage_id": storage_id,
                        "status": "published",
                        "duration": res.get("duration", 0),
                        "mime_type": "video/mp4",
                        "updated_at": datetime.utcnow().isoformat()
                    }}
                )
                print(f"  ✓ Migrated to Cloudinary: {cloud_video_url}")
                recovered.append({"id": reel_id, "caption": caption, "video_url": cloud_video_url})
            except Exception as e:
                print(f"  ✗ Cloudinary upload failed: {e}")
                recovered.append({"id": reel_id, "caption": caption, "video_url": None, "note": "Local intact, cloud pending"})
        else:
            recovered.append({"id": reel_id, "caption": caption, "video_url": None, "note": "Local file intact, ready for cloud"})
    else:
        # Video file truly missing
        print(f"✗ Reel {reel_id} ('{caption}') has NO video file! Marking status='missing'")
        reels_col.update_one(
            {"id": reel_id},
            {"$set": {"status": "missing", "updated_at": datetime.utcnow().isoformat()}}
        )
        missing.append({"id": reel_id, "caption": caption, "created_at": created_at})

print("\n================== SUMMARY ==================")
print(f"Recovered Reels: {len(recovered)}")
for r in recovered:
    print(f"  - [{r['id']}] {r['caption']} -> {r.get('video_url') or r.get('note')}")
print(f"Missing Reels: {len(missing)}")
for m in missing:
    print(f"  - [{m['id']}] {m['caption']} (Created: {m['created_at']})")
print(f"Promo Reels: {len(promos)}")
print("=============================================\n")
