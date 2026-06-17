"""Deterministic prompt builders (no network) — mirrors server/src/digest/prompt.ts."""
from typing import Optional

from schema import CATEGORIES


def build_system_prompt() -> str:
    return " ".join(
        [
            "You are a precise content-digest assistant.",
            "Given an article, produce: a 1-3 sentence summary; up to 5 concise key points;",
            "up to 5 lowercase keyword tags; and the single best-fit category.",
            f"The category MUST be exactly one of: {', '.join(CATEGORIES)}.",
            "Tags must be lowercase, with no leading hashtag.",
            "Base everything only on the provided article — do not invent facts.",
        ]
    )


def build_user_content(text: str, title: Optional[str] = None) -> str:
    clean_title = title.strip() if title else ""
    header = f"Title: {clean_title}\n\n" if clean_title else ""
    return f"{header}Article:\n{text.strip()}"
