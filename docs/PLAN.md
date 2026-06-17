# PLAN — Content Digest (target architecture)

> **Status: forward-looking target, not the current build.** The shipped app uses a Node/Hono API, Anthropic/Claude, and `localStorage` (see [ADR 002](decisions/002-content-digest-architecture.md), [ADR 003](decisions/003-backend-dependencies.md)). Adopting this plan would **supersede** those ADRs and the "no database" line in [constraints.md](constraints.md) — each via a new ADR — and rewrite the backend. This document describes where we're headed, not what exists today.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Vite + React + TypeScript |
| API | Python **FastAPI**, served as a serverless function under `/api` on **Vercel** |
| Storage | **Postgres** (cards persist server-side) |
| AI | **OpenRouter** (single chat-completions call for the digest) |
| Hosting | Vercel (static frontend + Python functions) |

The frontend calls only `POST /api/digest`. The API extracts article text, calls OpenRouter, writes the card to Postgres, and returns it. No secrets in the browser.

## Folder structure

```
content-digest/
  web/                      # Vite + React + TS frontend
    src/
      components/           # form, board, card (presentational)
      lib/api.ts            # fetch wrapper for /api
    index.html
    package.json
  api/                      # FastAPI on Vercel (Python serverless)
    index.py                # ASGI app: POST /api/digest, GET /api/cards
    digest.py               # OpenRouter call + prompt + response shape
    extract.py              # fetch URL + readability extraction
    db.py                   # Postgres pool + queries (cards table)
    requirements.txt        # fastapi, httpx, asyncpg, ...
  docs/                     # PRD, PLAN, decisions, constraints
  vercel.json               # build + routing (web → static, /api → python)
  .env.example              # OPENROUTER_API_KEY, DATABASE_URL, OPENROUTER_MODEL
```

## Data model (MVP)

One table, `cards`: `id`, `url`, `title`, `summary`, `key_points` (text[]), `tags` (text[]), `category`, `created_at`.

## Build steps (empty → MVP)

1. **Frontend shell.** Scaffold `web/` (Vite React TS). Build the paste form (URL or text) and the topic board with static placeholder cards. No API yet.
2. **Digest API.** Add `api/` FastAPI with `POST /api/digest`: extract article text (`extract.py`), call OpenRouter (`digest.py`) for summary/key points/tags/category, return JSON. Run locally with env vars.
3. **Persistence.** Provision a Postgres instance; create the `cards` table; have `POST /api/digest` insert and `GET /api/cards` read. Board now loads from the server.
4. **Wire it together.** Point `web/lib/api.ts` at `/api`; submit → digest → card appears; reload pulls cards from Postgres. Handle empty/invalid input and extraction failures.
5. **Deploy.** Add `vercel.json`; deploy frontend + Python functions to Vercel; set `OPENROUTER_API_KEY` and `DATABASE_URL`; verify the MVP success criteria from [PRD.md](PRD.md) end-to-end on the deployed URL.

## Out of scope (unchanged from PRD)

Accounts/auth, multi-device sync, search, editing/moving cards, browser extension. See [PRD.md](PRD.md) for full scope and MVP success criteria.
