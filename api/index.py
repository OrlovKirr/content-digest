"""FastAPI app: POST /api/digest (+ GET /api/health).

Thin wiring layer (ADR 004): validate the request, extract the article when only
a URL is given, then digest via OpenRouter (key present) or the deterministic
fallback (key absent). Status codes mirror the Hono handler: 400 / 502 / 500.
"""
import os
import sys
from pathlib import Path

# Ensure sibling modules (db, digest, …) import on Vercel regardless of the
# function's working directory.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

import db
from digest import openrouter_digest
from extract import extract_article
from fallback import fallback_digest


def _load_env() -> None:
    """Populate os.environ from api/.env if present (zero-dep, dev only)."""
    env_path = Path(__file__).with_name(".env")
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())


_load_env()

app = FastAPI(title="Content Digest API")


@app.get("/api/health")
async def health() -> dict:
    return {
        "ok": True,
        "openrouter": bool(os.environ.get("OPENROUTER_API_KEY")),
        "database": bool(db.database_url()),
    }


@app.get("/api/cards")
async def cards_endpoint():
    """All persisted cards, newest first ([] when no DATABASE_URL is set)."""
    try:
        return await db.fetch_cards()
    except Exception as err:
        return JSONResponse({"error": str(err)}, status_code=500)


@app.post("/api/digest")
async def digest_endpoint(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "invalid JSON body"}, status_code=400)
    if not isinstance(body, dict):
        return JSONResponse({"error": "invalid JSON body"}, status_code=400)

    url = str(body.get("url") or "").strip()
    text = str(body.get("text") or "").strip()
    title = None

    if not text:
        if not url:
            return JSONResponse(
                {"error": 'provide a non-empty "url" or "text"'}, status_code=400
            )
        try:
            extracted = await extract_article(url)
            text = extracted["text"] or ""
            title = extracted.get("title")
        except Exception as err:
            return JSONResponse({"error": str(err)}, status_code=502)

    api_key = os.environ.get("OPENROUTER_API_KEY")
    model = os.environ.get("OPENROUTER_MODEL")

    if api_key:
        try:
            digest = await openrouter_digest(text, title, api_key=api_key, model=model)
        except Exception as err:
            return JSONResponse({"error": str(err)}, status_code=500)
    else:
        digest = fallback_digest(text, title)

    try:
        return await db.insert_card(url, title, digest)
    except Exception as err:
        return JSONResponse({"error": str(err)}, status_code=500)
