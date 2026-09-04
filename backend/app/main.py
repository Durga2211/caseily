from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import tracking, reviews
import os

app = FastAPI(title = "Caseily Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://caseily.vercel.app", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(tracking.router)
app.include_router(reviews.router)

# Mount uploads directory for serving review photos
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
def read_root():
    return {"message":"Hello world from caseily."}
