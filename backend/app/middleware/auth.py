import os
from fastapi import Depends, HTTPException, Request
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env.local"))
load_dotenv()

from backend.app.models.db import get_pool


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header[7:]
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT s."userId", u.name, u.email,
                   u."softwareBackground", u."gpuTier", u."ramTier",
                   u."hasJetson", u."robotPlatform"
            FROM session s
            JOIN "user" u ON u.id = s."userId"
            WHERE s.token = $1 AND s."expiresAt" > NOW()
            """,
            token,
        )
    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    return dict(row)
