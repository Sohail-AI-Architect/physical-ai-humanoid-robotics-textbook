import os
import ssl
import asyncpg
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env.local"))
load_dotenv()

_pool: asyncpg.Pool | None = None


def _get_dsn() -> str:
    """Return a cleaned DSN suitable for asyncpg."""
    dsn = os.getenv("DATABASE_URL", "")
    # asyncpg handles sslmode via the `ssl` parameter, not query string
    if "?" in dsn:
        base, query = dsn.split("?", 1)
        params = [p for p in query.split("&")
                  if not p.startswith("sslmode=") and not p.startswith("channel_binding=")]
        dsn = f"{base}?{'&'.join(params)}" if params else base
    return dsn


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        _pool = await asyncpg.create_pool(
            dsn=_get_dsn(),
            min_size=1,
            max_size=5,
            ssl=ctx,
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
