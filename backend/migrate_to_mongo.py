import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    print("ERROR: MONGO_URI is missing in .env")
    exit(1)

client = MongoClient(MONGO_URI)
db = client.get_database("caseily")

reviews_collection = db["reviews"]
notifications_collection = db["notifications"]

def migrate():
    # 1. Migrate Reviews
    reviews_file = os.path.join(os.path.dirname(__file__), "reviews_db.json")
    if os.path.exists(reviews_file):
        with open(reviews_file, "r") as f:
            reviews = json.load(f)
            if reviews:
                # Remove existing to prevent duplicates during testing
                reviews_collection.delete_many({}) 
                reviews_collection.insert_many(reviews)
                print(f"✅ Migrated {len(reviews)} reviews to MongoDB.")
            else:
                print("No reviews to migrate.")
    else:
        print("reviews_db.json not found.")

    # 2. Migrate Notifications
    notifs_file = os.path.join(os.path.dirname(__file__), "notifications_db.json")
    if os.path.exists(notifs_file):
        with open(notifs_file, "r") as f:
            notifs = json.load(f)
            if notifs:
                notifications_collection.delete_many({})
                notifications_collection.insert_many(notifs)
                print(f"✅ Migrated {len(notifs)} notifications to MongoDB.")
            else:
                print("No notifications to migrate.")
    else:
        print("notifications_db.json not found.")

if __name__ == "__main__":
    print("Starting MongoDB migration...")
    migrate()
    print("Migration complete!")
