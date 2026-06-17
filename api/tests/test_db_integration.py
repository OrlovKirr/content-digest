"""Live-DB integration test for db.py.

Skipped unless DATABASE_URL is set (no DB in CI/dev by default, same posture as
the live OpenRouter call). Run against a throwaway Postgres:

    DATABASE_URL=postgresql://localhost/digest_test \\
      ./.venv/bin/python -m pytest tests/test_db_integration.py -q
"""
import asyncio
import os

import pytest

pytestmark = pytest.mark.skipif(
    not os.environ.get("DATABASE_URL"),
    reason="DATABASE_URL not set; skipping live Postgres integration test",
)

DIGEST = {
    "summary": "An integration summary.",
    "key_points": ["alpha", "beta"],
    "tags": ["ai", "data"],
    "suggested_category": "Technology",
}


def test_insert_then_fetch_roundtrips_a_card():
    import db

    async def run():
        card = await db.insert_card("https://example.test", "Example", DIGEST)
        cards = await db.fetch_cards()
        return card, cards

    card, cards = asyncio.run(run())
    assert card.id
    assert card.url == "https://example.test"
    assert card.category == "Technology"
    assert card.key_points == ["alpha", "beta"]

    assert any(c.id == card.id for c in cards)
    # Newest first.
    assert cards[0].created_at >= cards[-1].created_at
