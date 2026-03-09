import uuid
import logging
from fastapi import APIRouter

from backend.app.models.schemas import ChatRequest, ChatResponse
from backend.app.rag.service import RAGService

logger = logging.getLogger(__name__)

router = APIRouter()
rag_service = RAGService()

FALLBACK_ANSWER = (
    "I'm sorry, I'm having trouble connecting to my AI backend right now. "
    "Please try again in a moment. If the problem persists, check that the "
    "backend services (OpenRouter, Cohere, Qdrant) are reachable."
)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        answer, citations = await rag_service.answer(
            query=request.query,
            scope=request.scope,
            selected_text=request.selected_text,
        )
        return ChatResponse(
            answer=answer,
            citations=citations,
            session_id=request.session_id or str(uuid.uuid4()),
            turn_id=str(uuid.uuid4()),
        )
    except Exception as e:
        logger.exception("Chat endpoint error for query=%r: %s", request.query, e)
        # Return a 200 with a graceful error message instead of 503
        return ChatResponse(
            answer=FALLBACK_ANSWER,
            citations=[],
            session_id=request.session_id or str(uuid.uuid4()),
            turn_id=str(uuid.uuid4()),
        )
