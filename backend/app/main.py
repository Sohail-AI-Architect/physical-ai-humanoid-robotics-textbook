import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure repo root is on sys.path for `backend.app.*` imports
_repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.local"))
load_dotenv()

from backend.app.routers import chat, index, personalize, translate, profile
from backend.app.models.db import init_tables, close_pool


@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("DATABASE_URL"):
        await init_tables()
    yield
    await close_pool()


app = FastAPI(
    title="Physical AI RAG Chatbot API",
    description="RAG-powered Q&A backend for the Physical AI & Humanoid Robotics textbook",
    version="1.0.0",
    lifespan=lifespan,
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
app.include_router(personalize.router, prefix="/api")
app.include_router(translate.router, prefix="/api")
app.include_router(profile.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "service": "Physical AI RAG Chatbot API"}
