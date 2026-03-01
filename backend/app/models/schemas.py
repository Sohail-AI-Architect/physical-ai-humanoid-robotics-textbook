from pydantic import BaseModel, Field
from typing import Optional
import uuid


class Citation(BaseModel):
    chunk_id: str
    chapter_title: str
    section_title: str
    url_fragment: str
    relevance_score: float


class ChatTurn(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    answer: str
    citations: list[Citation] = []
    scope: str = "global"
    timestamp: str = ""


class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = "New Chat"
    created_at: str = ""
    updated_at: str = ""
    turns: list[ChatTurn] = []


class ChatRequest(BaseModel):
    query: str
    scope: str = "global"
    selected_text: Optional[str] = None
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation] = []
    session_id: str
    turn_id: str


class HealthResponse(BaseModel):
    status: str
    total_chunks: int
    collection_name: str


class IndexRebuildResponse(BaseModel):
    status: str
    chunks_indexed: int
    duration_ms: float
