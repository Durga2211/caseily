"""Diagnose reels state in MongoDB and GridFS"""
from pymongo import MongoClient
import gridfs, os
from dotenv import load_dotenv
load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client.get_database('caseily')
fs = gridfs.GridFS(db)

# 1. All reel records in MongoDB
print('=== REELS IN MONGODB ===')
for r in db['reels'].find({}, {'_id': 0}):
    cap = (r.get('caption') or '')[:40]
    print(f"  id={r.get('id')}  video={r.get('video')}  is_local_promo={r.get('is_local_promo')}  caption={cap}  status={r.get('status')}  created_at={r.get('created_at')}")

# 2. All files in GridFS
print()
print('=== FILES IN GRIDFS ===')
for f in db['fs.files'].find():
    print(f"  filename={f.get('filename')}  content_type={f.get('content_type')}  length={f.get('length')}  reel_id={f.get('reel_id')}  uploadDate={f.get('uploadDate')}")

# 3. Check if any gridfs files actually exist for the non-promo reels
print()
print('=== GRIDFS EXISTENCE CHECK FOR NON-PROMO REELS ===')
for r in db['reels'].find({}, {'_id': 0, 'id': 1, 'video': 1, 'is_local_promo': 1}):
    vid = r.get('video', '')
    is_promo = r.get('is_local_promo', False)
    try:
        gf = fs.get_last_version(filename=vid)
        print(f"  reel={r['id']}  video={vid}  is_promo={is_promo}  FOUND  size={gf.length}  content_type={gf.content_type}")
    except Exception as e:
        print(f"  reel={r['id']}  video={vid}  is_promo={is_promo}  MISSING  error={e}")
