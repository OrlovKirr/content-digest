"""The persisted Card: model + pure mappers between digests, DB rows, and Cards.

A Card is a digest plus its storage identity (`id`, `url`, `created_at`). The
`category` column carries the digest's `suggested_category`. These helpers are
pure (db.py is the thin asyncpg shell that calls them); they own the column
order so the SQL and the row mapping cannot drift apart.
"""
import uuid
from datetime import datetime, timezone
from typing import Any, List, Mapping, Optional, Tuple

from pydantic import BaseModel

# Column order for INSERT; insert_values() returns values in exactly this order.
INSERT_COLUMNS = ("id", "url", "title", "summary", "key_points", "tags", "category")


class Card(BaseModel):
    """A stored digest as returned by POST /api/digest and GET /api/cards."""

    id: str
    url: str
    title: str
    summary: str
    key_points: List[str]
    tags: List[str]
    category: str
    created_at: datetime


def insert_values(
    url: Optional[str],
    title: Optional[str],
    digest: Mapping[str, Any],
    *,
    card_id: Optional[str] = None,
) -> Tuple[Any, ...]:
    """Build the INSERT value tuple (aligned with INSERT_COLUMNS) from a digest.

    Defaults `id` to a `uuid.UUID` (what asyncpg binds to a uuid column);
    row_to_card stringifies it back for the Card model.
    """
    return (
        card_id or uuid.uuid4(),
        url or "",
        title or "",
        digest["summary"],
        list(digest["key_points"]),
        list(digest["tags"]),
        digest["suggested_category"],
    )


def row_to_card(row: Mapping[str, Any]) -> Card:
    """Map a DB record (asyncpg Record or dict) into a Card."""
    return Card(
        id=str(row["id"]),
        url=row["url"],
        title=row["title"],
        summary=row["summary"],
        key_points=list(row["key_points"]),
        tags=list(row["tags"]),
        category=row["category"],
        created_at=row["created_at"],
    )


def synthesize_card(
    url: Optional[str],
    title: Optional[str],
    digest: Mapping[str, Any],
    *,
    now: Optional[datetime] = None,
    card_id: Optional[str] = None,
) -> Card:
    """Build a Card in memory (no DB) — used when DATABASE_URL is unset."""
    return Card(
        id=card_id or str(uuid.uuid4()),
        url=url or "",
        title=title or "",
        summary=digest["summary"],
        key_points=list(digest["key_points"]),
        tags=list(digest["tags"]),
        category=digest["suggested_category"],
        created_at=now or datetime.now(timezone.utc),
    )
