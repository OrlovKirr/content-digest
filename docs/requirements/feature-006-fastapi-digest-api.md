# Feature 006 — Python FastAPI digest API (`POST /api/digest`)

> PLAN step 2/5 ([PLAN.md](../PLAN.md)), GitHub issue #7. Architecture: [ADR 004](../decisions/004-new-stack-fastapi-vercel.md) (FastAPI / Vercel / Postgres / OpenRouter stack) — this feature implements its `api/` digest step.

## User story

As a user, I want to paste an article **URL** or **text** to a Python `/api/digest` endpoint and get a genuine AI digest (summary, key points, tags, category), so the new target-stack frontend (issue #9) and Postgres layer (issue #8) can build on it.

## Architecture

- New `api/` package: a FastAPI ASGI app exposing `POST /api/digest` (and `GET /api/health`).
- Request: `{ url?: string, text?: string }`. If `text` is absent and `url` is present, fetch + extract the article (`httpx` + `readability-lxml`). At least one must yield content.
- Digest via **OpenRouter** chat-completions (`OPENROUTER_MODEL`, default `anthropic/claude-opus-4-8`) over `httpx`, with `response_format` JSON schema + defensive parse → `normalize_digest`.
- Response (**snake_case**): `{ summary, key_points[], tags[], suggested_category, title? }`.
- Key lives only in `api/.env` (gitignored, `OPENROUTER_API_KEY`). When unset, a deterministic **fallback** digest is returned so dev works with no key.

## Acceptance criteria

- GIVEN `POST /api/digest` with `{ text }` THEN the response is a valid digest: non-empty `summary`, 1–5 `key_points`, 1–5 lowercase unique `tags`, `suggested_category` in the taxonomy (Technology, Business, Science, Health, Culture, Other).
- GIVEN `POST /api/digest` with `{ url }` and no text THEN the API fetches + extracts the article, then digests it.
- GIVEN an empty body (no `url`, no `text`) or invalid JSON THEN the API responds `400`.
- GIVEN extraction of a `url` fails THEN the API responds `502`.
- GIVEN `OPENROUTER_API_KEY` is unset THEN a deterministic fallback digest is returned (the endpoint never hard-fails for lack of a key); GIVEN it is set THEN the digest is produced by OpenRouter, and a failing call responds `500`.
- The API key never reaches the browser.

## Pure modules (logic — specced with pytest)

- `api/schema.py` — `CATEGORIES`, pydantic `DigestInput`/`DigestResponse`, and `normalize_digest()` (clamp to ≤5 key points / ≤5 lowercase unique tags; category outside taxonomy → `Other`).
- `api/prompt.py` — `build_system_prompt()` / `build_user_content({text, title})` (deterministic, no network).
- `api/fallback.py` — `fallback_digest({text, title})`: deterministic, returns a valid digest with no key/network (ported from `server/src/digest/fallback.ts`).
- `api/extract.py` — pure `strip_html()` helper (the `httpx` fetch is a thin shell).

## Out of scope

- Postgres persistence + `GET /api/cards` (issue #8).
- Wiring the frontend to `/api` (issue #9); Vercel deploy (issue #10).
- Retiring the `server/` (Hono) package — it coexists until cutover.
- Auth, rate limiting, caching, batch.

## Open questions

- None. Provider (OpenRouter), default model (`anthropic/claude-opus-4-8`), response casing (snake_case), and fallback (ported) all decided.
