from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import StreamingResponse
from .routers import tracking, reviews, insiders, reels, chat, notifications, news, auth, drops, events, games
from .db import fs
import gridfs

app = FastAPI(title="Caseily Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://caseily.vercel.app", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(tracking.router)
app.include_router(reviews.router)
app.include_router(insiders.router)
app.include_router(reels.router)
app.include_router(chat.router)
app.include_router(notifications.router)
app.include_router(news.router)
app.include_router(drops.router)
app.include_router(auth.router, prefix="/api/auth")
app.include_router(events.router, prefix="/api")
app.include_router(games.router)

import os
import mimetypes
from fastapi.responses import FileResponse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL_UPLOADS = os.path.join(BASE_DIR, "uploads")
os.makedirs(os.path.join(LOCAL_UPLOADS, "reels"), exist_ok=True)

@app.api_route("/uploads/{filename:path}", methods=["GET", "HEAD"])
async def get_upload(filename: str):
    # 1. Check GridFS first (persistent storage — works on Vercel)
    if fs is not None:
        try:
            grid_out = fs.get_last_version(filename=filename)
            content_type = grid_out.content_type or mimetypes.guess_type(filename)[0] or "application/octet-stream"

            def iterfile():
                while True:
                    chunk = grid_out.read(1024 * 1024)  # 1MB chunks for video streaming
                    if not chunk:
                        break
                    yield chunk

            return StreamingResponse(
                iterfile(),
                media_type=content_type,
                headers={
                    "Accept-Ranges": "bytes",
                    "Cache-Control": "public, max-age=31536000, immutable",
                    "Content-Length": str(grid_out.length),
                }
            )
        except Exception:
            pass

    # 2. Fallback: Check local uploads folder (dev only — ephemeral on Vercel)
    local_path = os.path.join(LOCAL_UPLOADS, filename)
    if os.path.exists(local_path) and os.path.isfile(local_path):
        media_type, _ = mimetypes.guess_type(local_path)
        return FileResponse(
            local_path,
            media_type=media_type or "application/octet-stream",
            headers={"Accept-Ranges": "bytes", "Cache-Control": "public, max-age=31536000"}
        )

    raise HTTPException(status_code=404, detail="File not found")

@app.get("/")
def read_root():
    return {"message":"Hello world from caseily."}

