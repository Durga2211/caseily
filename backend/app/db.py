import os
from pymongo import MongoClient
import gridfs
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# The database name will be determined by the URI or default to 'caseily'
if MONGO_URI:
    client = MongoClient(MONGO_URI)
    db = client.get_database("caseily")
    fs = gridfs.GridFS(db)
    
    # Collections
    reviews_collection = db["reviews"]
    notifications_collection = db["notifications"]
    insiders_collection = db["insiders"]
    news_collection = db["news"]
    vip_requests_collection = db["vip_requests"]
    room_messages_collection = db["room_messages"]
    users_collection = db["users"]
    drops_collection = db["exclusive_drops"]
    events_collection = db["events"]
    stage_messages_collection = db["stage_messages"]
else:
    print("WARNING: MONGO_URI not found in environment. Database connection will fail.")
    client = None
    db = None
    fs = None
    reviews_collection = None
    notifications_collection = None
    insiders_collection = None
    news_collection = None
    vip_requests_collection = None
    room_messages_collection = None
    users_collection = None
    drops_collection = None
    events_collection = None
    stage_messages_collection = None
