from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .routers import tracking, reviews, insiders, reels, chat, notifications
from .db import fs
import gridfs

app = FastAPI(title="Caseily Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://caseily.vercel.app", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tracking.router)
app.include_router(reviews.router)
app.include_router(insiders.router)
app.include_router(reels.router)
app.include_router(chat.router)
app.include_router(notifications.router)

@app.get("/uploads/{filename}")
async def get_upload(filename: str):
    if fs is None:
        raise HTTPException(status_code=500, detail="GridFS not configured")
    try:
        # get the latest version if multiple exist
        grid_out = fs.get_last_version(filename=filename)
        return StreamingResponse(grid_out, media_type=grid_out.content_type)
    except gridfs.errors.NoFile:
        raise HTTPException(status_code=404, detail="File not found")

@app.get("/")
def read_root():
    return {"message":"Hello world from caseily."}

