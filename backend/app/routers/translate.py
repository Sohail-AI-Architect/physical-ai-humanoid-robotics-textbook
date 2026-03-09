from fastapi import APIRouter, Depends, HTTPException

from backend.app.middleware.auth import get_current_user
from backend.app.models.schemas import TranslateRequest, TranslateResponse
from backend.app.services.cache import compute_content_hash, get_translation, set_translation
from backend.app.services.translate import translate_to_urdu

router = APIRouter()


@router.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest, user: dict = Depends(get_current_user)):
    content_hash = compute_content_hash(req.chapter_content)

    cached = await get_translation(req.chapter_slug, content_hash)
    if cached:
        return TranslateResponse(urdu_content=cached, cached=True)

    try:
        result = await translate_to_urdu(req.chapter_content)
    except Exception:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable. Please try again in a moment.")

    await set_translation(req.chapter_slug, content_hash, result)
    return TranslateResponse(urdu_content=result, cached=False)
