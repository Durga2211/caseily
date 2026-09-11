import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient
import gridfs
import mimetypes

# Load environment
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("MONGO_URI not found!")
    exit(1)

client = MongoClient(MONGO_URI)
db = client.get_database("caseily")
fs = gridfs.GridFS(db)
insiders_collection = db["insiders"]

DB_PATH = os.path.join(os.path.dirname(__file__), "insiders_db.json")
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")

def migrate():
    print("Starting insiders migration...")
    
    # 1. Migrate JSON data
    if os.path.exists(DB_PATH):
        try:
            with open(DB_PATH, "r") as f:
                posts = json.load(f)
            
            if posts:
                print(f"Found {len(posts)} posts in insiders_db.json")
                for post in posts:
                    # check if already exists
                    if not insiders_collection.find_one({"id": post["id"]}):
                        insiders_collection.insert_one(post)
                        print(f"Inserted post {post['id']}")
                    else:
                        print(f"Post {post['id']} already exists, skipping")
            else:
                print("insiders_db.json is empty")
        except Exception as e:
            print(f"Error reading insiders_db.json: {e}")
    else:
        print("No insiders_db.json found")

    # 2. Migrate existing local images to GridFS
    if os.path.exists(UPLOADS_DIR):
        print(f"Scanning {UPLOADS_DIR} for images...")
        for filename in os.listdir(UPLOADS_DIR):
            filepath = os.path.join(UPLOADS_DIR, filename)
            if os.path.isfile(filepath):
                # Check if it's already in GridFS
                if not fs.exists(filename=filename):
                    print(f"Uploading {filename} to GridFS...")
                    content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
                    try:
                        with open(filepath, "rb") as f:
                            fs.put(f, filename=filename, content_type=content_type)
                        print(f"Successfully uploaded {filename}")
                    except Exception as e:
                        print(f"Failed to upload {filename}: {e}")
                else:
                    print(f"File {filename} already in GridFS, skipping")
    else:
        print("No uploads directory found")

    print("Migration complete!")

if __name__ == "__main__":
    migrate()
