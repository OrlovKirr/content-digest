"""Taxonomy, request/response models, and digest normalization.

Single source of the category taxonomy, shared in spirit with the frontend's
Category union and the Postgres `category` column (PLAN.md).
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

CATEGORIES = (
    "Technology",
    "Business",
    "Science",
    "Health",
    "Culture",
    "Other",
)


class DigestInput(BaseModel):
    """The text (and optional title) handed to the digester."""

    text: str
    title: Optional[str] = None


class DigestRequest(BaseModel):
    """POST /api/digest body: at least one of url/text must yield content."""

    url: Optional[str] = None
    text: Optional[str] = None


class DigestResponse(BaseModel):
    """The digest returned to the client (snake_case, per ADR 004)."""

    summary: str
    key_points: List[str]
    tags: List[str]
    suggested_category: str
    title: Optional[str] = None


def _get(raw: Dict[str, Any], *keys: str) -> Any:
    """First present value among `keys` (tolerates camelCase model output)."""
    for key in keys:
        if key in raw and raw[key] is not None:
            return raw[key]
    return None


def normalize_digest(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Clamp/normalize a raw digest to the contract the frontend expects.

    - summary: trimmed
    - key_points: trimmed, non-empty, max 5; defaults to [summary] if empty
    - tags: lowercase, trimmed, unique, non-empty, max 5; defaults to ["untagged"]
    - suggested_category: must be in the taxonomy, else "Other"
    """
    summary = str(_get(raw, "summary") or "").strip()

    raw_points = _get(raw, "key_points", "keyPoints") or []
    key_points = [p.strip() for p in raw_points if isinstance(p, str) and p.strip()][:5]

    raw_tags = _get(raw, "tags") or []
    seen: set = set()
    tags: List[str] = []
    for tag in raw_tags:
        if not isinstance(tag, str):
            continue
        normalized = tag.strip().lower()
        if normalized and normalized not in seen:
            seen.add(normalized)
            tags.append(normalized)
    tags = tags[:5]

    category = _get(raw, "suggested_category", "suggestedCategory")
    suggested_category = category if category in CATEGORIES else "Other"

    return {
        "summary": summary,
        "key_points": key_points if key_points else [summary],
        "tags": tags if tags else ["untagged"],
        "suggested_category": suggested_category,
    }
