import uuid
from fastapi import APIRouter, HTTPException

try:
    from backend.app.models.schemas import ChatRequest, ChatResponse
    from backend.app.rag.service import RAGService
except ImportError:
    from app.models.schemas import ChatRequest, ChatResponse
    from app.rag.service import RAGService

router = APIRouter()
rag_service = RAGService()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        answer, citations = rag_service.answer(
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
        raise HTTPException(status_code=503, detail=f"Chat service unavailable: {type(e).__name__}: {e}")
