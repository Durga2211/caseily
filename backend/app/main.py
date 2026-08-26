from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import tracking
app = FastAPI(title = "Caseily Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://caseily.vercel.app", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(tracking.router)
@app.get("/")
def read_root():
    return {"message":"Hello world from caseily."}
