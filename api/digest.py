"""OpenRouter chat-completions digest (ADR 005).

Thin network shell: build prompt -> call OpenRouter -> JSON -> normalize_digest.
"""
import json
from typing import Dict, Optional

import httpx

from prompt import build_system_prompt, build_user_content
from schema import CATEGORIES, normalize_digest

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Default model routed via OpenRouter (ADR 005); override with OPENROUTER_MODEL.
DEFAULT_MODEL = "anthropic/claude-opus-4-8"

_RESPONSE_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "digest",
        "strict": True,
        "schema": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "summary": {"type": "string"},
                "key_points": {"type": "array", "items": {"type": "string"}},
                "tags": {"type": "array", "items": {"type": "string"}},
                "suggested_category": {"type": "string", "enum": list(CATEGORIES)},
            },
            "required": ["summary", "key_points", "tags", "suggested_category"],
        },
    },
}


async def openrouter_digest(
    text: str,
    title: Optional[str] = None,
    *,
    api_key: str,
    model: Optional[str] = None,
) -> Dict[str, object]:
    payload = {
        "model": model or DEFAULT_MODEL,
        "messages": [
            {"role": "system", "content": build_system_prompt()},
            {"role": "user", "content": build_user_content(text, title)},
        ],
        "response_format": _RESPONSE_FORMAT,
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as err:
        raise ValueError("digest: OpenRouter returned no message content") from err

    try:
        parsed = json.loads(content)
    except (json.JSONDecodeError, TypeError) as err:
        raise ValueError("digest: model output was not valid JSON") from err

    return normalize_digest(parsed)
