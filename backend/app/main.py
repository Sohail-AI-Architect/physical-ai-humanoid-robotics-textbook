import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.local"))
load_dotenv()

try:
    from backend.app.routers import chat, index
except ImportError:
    from app.routers import chat, index

app = FastAPI(
    title="Physical AI RAG Chatbot API",
    description="RAG-powered Q&A backend for the Physical AI & Humanoid Robotics textbook",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(index.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "service": "Physical AI RAG Chatbot API"}
