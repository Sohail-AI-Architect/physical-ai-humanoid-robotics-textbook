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


# --- Step 3: Personalize + Translate + Profile ---

class PersonalizeRequest(BaseModel):
    chapter_slug: str
    chapter_content: str


class PersonalizeResponse(BaseModel):
    personalized_content: str
    cached: bool = False


class TranslateRequest(BaseModel):
    chapter_slug: str
    chapter_content: str


class TranslateResponse(BaseModel):
    urdu_content: str
    cached: bool = False


class UserProfile(BaseModel):
    name: str
    email: str
    softwareBackground: list[str] = []
    gpuTier: str = "None"
    ramTier: str = "16GB"
    hasJetson: bool = False
    robotPlatform: str = "None"


class ProfileUpdateRequest(BaseModel):
    softwareBackground: Optional[list[str]] = None
    gpuTier: Optional[str] = None
    ramTier: Optional[str] = None
    hasJetson: Optional[bool] = None
    robotPlatform: Optional[str] = None
