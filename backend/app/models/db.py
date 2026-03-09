import os
import asyncpg
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env.local"))
load_dotenv()

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=os.getenv("DATABASE_URL"),
            min_size=1,
            max_size=5,
        )
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


PERSONALIZATION_CACHE_DDL = """
CREATE TABLE IF NOT EXISTS personalization_cache (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    chapter_slug TEXT NOT NULL,
    profile_hash TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, chapter_slug, profile_hash)
);
"""

TRANSLATION_CACHE_DDL = """
CREATE TABLE IF NOT EXISTS translation_cache (
    id SERIAL PRIMARY KEY,
    chapter_slug TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    urdu_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chapter_slug, content_hash)
);
"""


async def init_tables():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(PERSONALIZATION_CACHE_DDL)
        await conn.execute(TRANSLATION_CACHE_DDL)
