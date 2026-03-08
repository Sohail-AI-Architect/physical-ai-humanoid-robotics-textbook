import hashlib
import json

from backend.app.models.db import get_pool


def compute_profile_hash(user: dict) -> str:
    profile_data = {
        "softwareBackground": user.get("softwareBackground", "[]"),
        "gpuTier": user.get("gpuTier", "None"),
        "ramTier": user.get("ramTier", "16GB"),
        "hasJetson": user.get("hasJetson", False),
        "robotPlatform": user.get("robotPlatform", "None"),
    }
    return hashlib.sha256(json.dumps(profile_data, sort_keys=True).encode()).hexdigest()[:16]


def compute_content_hash(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()[:16]


async def get_personalization(user_id: str, chapter_slug: str, profile_hash: str) -> str | None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT content FROM personalization_cache WHERE user_id=$1 AND chapter_slug=$2 AND profile_hash=$3",
            user_id, chapter_slug, profile_hash,
        )
    return row["content"] if row else None


async def set_personalization(user_id: str, chapter_slug: str, profile_hash: str, content: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """INSERT INTO personalization_cache (user_id, chapter_slug, profile_hash, content)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (user_id, chapter_slug, profile_hash) DO UPDATE SET content=$4, created_at=NOW()""",
            user_id, chapter_slug, profile_hash, content,
        )


async def get_translation(chapter_slug: str, content_hash: str) -> str | None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT urdu_content FROM translation_cache WHERE chapter_slug=$1 AND content_hash=$2",
            chapter_slug, content_hash,
        )
    return row["urdu_content"] if row else None


async def set_translation(chapter_slug: str, content_hash: str, urdu_content: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """INSERT INTO translation_cache (chapter_slug, content_hash, urdu_content)
               VALUES ($1, $2, $3)
               ON CONFLICT (chapter_slug, content_hash) DO UPDATE SET urdu_content=$3, created_at=NOW()""",
            chapter_slug, content_hash, urdu_content,
        )
