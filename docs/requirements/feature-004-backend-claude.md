# Feature 004 — Backend proxy: real fetch + Claude

## User story

As a user, I want to paste an article **URL** and have the app fetch the real article text and produce a genuine AI digest (summary, key points, tags, category), so the board fills with real reading rather than text I paste by hand.

## Architecture (per ADR 002 / ADR 003)

- New `server/` package: a Hono HTTP proxy exposing `POST /api/digest`.
- Request: `{ url?: string; text?: string }`. If `text` is absent and `url` is present, the server fetches + extracts the article (`@extractus/article-extractor`). At least one of `url`/`text` must yield content.
- The server calls Claude (`claude-opus-4-8`) via `messages.parse()` with a Zod `Digest` schema → guaranteed-shape JSON.
- Response: a `Digest` (`summary`, `keyPoints`, `tags`, `suggestedCategory`) — the same shape the frontend already consumes.
- API key lives only in `server/.env` (gitignored). When `ANTHROPIC_API_KEY` is unset, the server returns a deterministic **fallback** digest so dev works with no key.
- Vite proxies `/api` → `127.0.0.1:8787`. The frontend swaps its mock `Digester` for an `HttpDigester` that POSTs to `/api/digest`, with the client-side mock as a fallback if the backend is unreachable.

## Acceptance criteria

- GIVEN a `POST /api/digest` with `{ text }` THEN the response is a valid `Digest` (non-empty summary, 1–5 keyPoints, 1–5 lowercase tags, category in the taxonomy).
- GIVEN a `POST /api/digest` with `{ url }` and no text THEN the server fetches and extracts the article, then digests it.
- GIVEN an empty body (no `url`, no `text`) THEN the server responds `400`.
- GIVEN `ANTHROPIC_API_KEY` is set THEN the digest is produced by Claude; GIVEN it is unset THEN a deterministic fallback digest is returned (the endpoint never hard-fails for lack of a key).
- GIVEN the backend is down THEN the frontend falls back to its local mock digester and still adds a card.

## Pure modules (logic — specced)

- `server/src/digest/schema.ts` — Zod `Digest` schema + `Category` enum (single source of the taxonomy).
- `server/src/digest/prompt.ts` — `buildSystemPrompt()` / `buildUserContent({text,title})` (deterministic, no network).
- `server/src/digest/fallback.ts` — `fallbackDigest({text,title})`: deterministic, returns a valid `Digest` with no key/network.
- `server/src/digest/normalize.ts` — clamp/normalize a raw digest to the contract (≤5 keyPoints, ≤5 lowercase tags, valid category).

## Out of scope

- Persisting digests server-side (board stays in `localStorage`).
- Auth, rate limiting, caching, multi-article batch.
- Editing/moving cards (still Feature N+1 territory).

## Open questions

- None. Model and extractor chosen; framework recommended (Hono).
