from fastapi import APIRouter, Depends, HTTPException

from backend.app.middleware.auth import get_current_user
from backend.app.models.schemas import PersonalizeRequest, PersonalizeResponse
from backend.app.services.cache import compute_profile_hash, get_personalization, set_personalization
from backend.app.services.personalize import personalize_chapter

router = APIRouter()


@router.post("/personalize", response_model=PersonalizeResponse)
async def personalize(req: PersonalizeRequest, user: dict = Depends(get_current_user)):
    user_id = user["userId"]
    profile_hash = compute_profile_hash(user)

    cached = await get_personalization(user_id, req.chapter_slug, profile_hash)
    if cached:
        return PersonalizeResponse(personalized_content=cached, cached=True)

    try:
        result = await personalize_chapter(user, req.chapter_content)
    except Exception:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable. Please try again in a moment.")

    await set_personalization(user_id, req.chapter_slug, profile_hash, result)
    return PersonalizeResponse(personalized_content=result, cached=False)
