"""Postgres persistence for cards (ADR 004, issue #8).

Thin async shell over asyncpg: a lazily-created global pool, idempotent schema
init from schema.sql, and insert/select for the single `cards` table. Pure
shaping (column order, row -> Card) lives in card.py.

Graceful degradation: when DATABASE_URL is unset the API still works without a
database — insert_card() synthesizes a Card in memory (not persisted) and
fetch_cards() returns []. This mirrors the OpenRouter-key-absent fallback in
digest.py and keeps dev/tests runnable with no DB.
"""
import asyncio
import os
from pathlib import Path
from typing import List, Optional

import asyncpg

from card import INSERT_COLUMNS, Card, insert_values, row_to_card, synthesize_card

_SELECT_COLUMNS = "id, url, title, summary, key_points, tags, category, created_at"

_pool: Optional[asyncpg.Pool] = None
_pool_lock = asyncio.Lock()


def database_url() -> Optional[str]:
    """The configured DATABASE_URL, or None when persistence is disabled."""
    return os.environ.get("DATABASE_URL") or None


async def get_pool() -> asyncpg.Pool:
    """Return the process-wide pool, creating it (and the schema) on first use.

    Double-checked under a lock so concurrent first requests (FastAPI serves them
    on one event loop) can't each create a pool and orphan one.
    """
    global _pool
    if _pool is not None:
        return _pool
    async with _pool_lock:
        if _pool is None:
            url = database_url()
            if not url:
                raise RuntimeError("DATABASE_URL is not set")
            pool = await asyncpg.create_pool(url, min_size=0, max_size=5)
            ddl = Path(__file__).with_name("schema.sql").read_text()
            async with pool.acquire() as conn:
                await conn.execute(ddl)
            _pool = pool
    return _pool


async def insert_card(
    url: Optional[str], title: Optional[str], digest: dict
) -> Card:
    """Persist a digest as a card and return it. No-DB: synthesize in memory."""
    if not database_url():
        return synthesize_card(url, title, digest)

    values = insert_values(url, title, digest)
    columns = ", ".join(INSERT_COLUMNS)
    placeholders = ", ".join(f"${i + 1}" for i in range(len(values)))
    query = (
        f"INSERT INTO cards ({columns}) VALUES ({placeholders}) "
        f"RETURNING {_SELECT_COLUMNS}"
    )
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *values)
    return row_to_card(row)


async def fetch_cards() -> List[Card]:
    """All cards, newest first. No-DB: returns []."""
    if not database_url():
        return []

    # id DESC breaks ties when two cards share a created_at (sub-µs inserts).
    query = f"SELECT {_SELECT_COLUMNS} FROM cards ORDER BY created_at DESC, id DESC"
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(query)
    return [row_to_card(row) for row in rows]
