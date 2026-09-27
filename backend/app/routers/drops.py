from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from datetime import datetime
from bson import ObjectId
from ..db import drops_collection, fs
import mimetypes

router = APIRouter(prefix="/api")

@router.get("/drops")
async def get_active_drops():
    if drops_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    # Return all drops for now, could filter by disabled=False
    drops = list(drops_collection.find())
    for d in drops:
        d["_id"] = str(d["_id"])
    return drops

@router.get("/admin/drops")
async def get_all_drops():
    if drops_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    drops = list(drops_collection.find().sort("created_at", -1))
    for d in drops:
        d["_id"] = str(d["_id"])
    return drops

@router.post("/admin/drops")
async def create_drop(
    title: str = Form(""),
    subtitle: str = Form(""),
    price: str = Form(""),
    expires: str = Form(""),
    expireColor: str = Form("#fef08a"),
    expireText: str = Form("#854d0e"),
    disabled: str = Form("false"),
    image: UploadFile = File(None)
):
    if drops_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    image_filename = None
    if image and image.filename:
        content = await image.read()
        mime_type, _ = mimetypes.guess_type(image.filename)
        mime_type = mime_type or 'application/octet-stream'
        
        # Use timestamp + filename to make it unique
        image_filename = f"{int(datetime.utcnow().timestamp())}_{image.filename}"
        
        # Save to GridFS
        fs.put(content, filename=image_filename, content_type=mime_type)

    drop_doc = {
        "title": title,
        "subtitle": subtitle,
        "price": price,
        "expires": expires,
        "expireColor": expireColor,
        "expireText": expireText,
        "disabled": disabled.lower() == 'true',
        "image": image_filename,
        "created_at": datetime.utcnow()
    }
    
    result = drops_collection.insert_one(drop_doc)
    drop_doc["_id"] = str(result.inserted_id)
    return drop_doc

@router.delete("/admin/drops/{drop_id}")
async def delete_drop(drop_id: str):
    if drops_collection is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    try:
        result = drops_collection.delete_one({"_id": ObjectId(drop_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Drop not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid drop ID")
