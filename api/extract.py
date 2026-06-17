"""Fetch a URL and extract clean article title + text (httpx + readability-lxml).

`strip_html` is the pure, spec-tested core; `extract_article` is a thin network
shell around it (mirrors server/src/extract.ts).
"""
import re
from typing import Dict, Optional

import httpx
from readability import Document

_BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


def strip_html(html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"&[a-z]+;", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


async def extract_article(url: str) -> Dict[str, Optional[str]]:
    """Fetch a URL and return {title, text}. Raises if nothing usable."""
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=15.0,
        headers={"User-Agent": _BROWSER_UA},
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        html = response.text

    doc = Document(html)
    text = strip_html(doc.summary(html_partial=True))
    if not text:
        raise ValueError(f"Could not extract article content from {url}")

    title = doc.short_title() or None
    return {"title": title, "text": text}
