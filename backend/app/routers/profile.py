import json
from fastapi import APIRouter, Depends

from backend.app.middleware.auth import get_current_user
from backend.app.models.schemas import UserProfile, ProfileUpdateRequest
from backend.app.models.db import get_pool

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_profile(user: dict = Depends(get_current_user)):
    sw = user.get("softwareBackground", "[]")
    if isinstance(sw, str):
        try:
            sw = json.loads(sw)
        except (json.JSONDecodeError, TypeError):
            sw = []

    return UserProfile(
        name=user.get("name", ""),
        email=user.get("email", ""),
        softwareBackground=sw,
        gpuTier=user.get("gpuTier", "None"),
        ramTier=user.get("ramTier", "16GB"),
        hasJetson=user.get("hasJetson", False),
        robotPlatform=user.get("robotPlatform", "None"),
    )


@router.put("/profile", response_model=UserProfile)
async def update_profile(req: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    user_id = user["userId"]
    pool = await get_pool()

    updates = []
    params = []
    idx = 1

    if req.softwareBackground is not None:
        updates.append(f'"softwareBackground"=${idx}')
        params.append(json.dumps(req.softwareBackground))
        idx += 1
    if req.gpuTier is not None:
        updates.append(f'"gpuTier"=${idx}')
        params.append(req.gpuTier)
        idx += 1
    if req.ramTier is not None:
        updates.append(f'"ramTier"=${idx}')
        params.append(req.ramTier)
        idx += 1
    if req.hasJetson is not None:
        updates.append(f'"hasJetson"=${idx}')
        params.append(req.hasJetson)
        idx += 1
    if req.robotPlatform is not None:
        updates.append(f'"robotPlatform"=${idx}')
        params.append(req.robotPlatform)
        idx += 1

    if updates:
        params.append(user_id)
        query = f'UPDATE "user" SET {", ".join(updates)} WHERE id=${idx}'
        async with pool.acquire() as conn:
            await conn.execute(query, *params)

    # Fetch updated user
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            'SELECT name, email, "softwareBackground", "gpuTier", "ramTier", "hasJetson", "robotPlatform" FROM "user" WHERE id=$1',
            user_id,
        )

    sw = row["softwareBackground"] if row else "[]"
    if isinstance(sw, str):
        try:
            sw = json.loads(sw)
        except (json.JSONDecodeError, TypeError):
            sw = []

    return UserProfile(
        name=row["name"],
        email=row["email"],
        softwareBackground=sw,
        gpuTier=row["gpuTier"] or "None",
        ramTier=row["ramTier"] or "16GB",
        hasJetson=row["hasJetson"] or False,
        robotPlatform=row["robotPlatform"] or "None",
    )
