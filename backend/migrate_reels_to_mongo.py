"""
Migrate existing reels from reels_db.json to MongoDB.
Also uploads any local video files to GridFS.

Run once: python -m migrate_reels_to_mongo
"""

import json
import os
import io
import mimetypes
from pymongo import MongoClient
import gridfs
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("ERROR: MONGO_URI not set in .env")
    exit(1)

client = MongoClient(MONGO_URI)
db = client.get_database("caseily")
fs = gridfs.GridFS(db)
reels_collection = db["reels"]

DB_PATH = os.path.join(os.path.dirname(__file__), "reels_db.json")
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads", "reels")

def migrate():
    if not os.path.exists(DB_PATH):
        print("No reels_db.json found, nothing to migrate.")
        return

    with open(DB_PATH, "r") as f:
        reels = json.load(f)

    print(f"Found {len(reels)} reels to migrate.")

    for reel in reels:
        reel_id = reel.get("id")

        # Check if already migrated
        if reels_collection.find_one({"id": reel_id}):
            print(f"  ⏭  Reel {reel_id} already exists in MongoDB, skipping.")
            continue

        video_path = reel.get("video", "")
        is_local_promo = reel.get("is_local_promo", False)

        # Try to upload video file to GridFS if it exists locally
        if not is_local_promo and video_path:
            local_file = os.path.join(os.path.dirname(__file__), "uploads", video_path)
            if os.path.exists(local_file):
                content_type = mimetypes.guess_type(local_file)[0] or "video/mp4"
                with open(local_file, "rb") as vf:
                    fs.put(
                        io.BytesIO(vf.read()),
                        filename=video_path,
                        content_type=content_type,
                        reel_id=reel_id,
                    )
                print(f"  📤 Uploaded video {video_path} to GridFS")
            else:
                print(f"  ⚠️  Local video file not found: {local_file}")

        # Insert metadata into MongoDB
        mongo_reel = {
            "id": reel_id,
            "caption": reel.get("caption", ""),
            "video": video_path,
            "created_at": reel.get("created_at", ""),
            "likes": reel.get("likes", 0),
            "comments": reel.get("comments", []),
            "is_local_promo": is_local_promo,
            "status": "published",
        }
        if reel.get("is_migrated"):
            mongo_reel["is_migrated"] = True

        reels_collection.insert_one(mongo_reel)
        print(f"  ✅ Migrated reel {reel_id}: {reel.get('caption', '')}")

    print(f"\nDone! {len(reels)} reels processed.")
    print(f"Total reels in MongoDB: {reels_collection.count_documents({})}")

if __name__ == "__main__":
    migrate()
