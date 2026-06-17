# Feature 007 — Postgres persistence (`cards` table + `GET /api/cards`)

> PLAN step 3/5 ([PLAN.md](../PLAN.md)), GitHub issue #8. Architecture: [ADR 004](../decisions/004-new-stack-fastapi-vercel.md) — this feature implements its Postgres step (one `cards` table, no ORM). No new ADR; ADR 004 already authorises the Postgres category and the single-table schema.

## User story

As a user, I want digested articles to persist server-side, so my board survives reloads, restarts, and devices — instead of living only in a browser or a single response.

## Architecture

- New `api/db.py`: a thin async shell over **asyncpg** — a lazily-created process-wide pool, idempotent schema init from `api/schema.sql`, and insert/select for one `cards` table. New runtime dependency `asyncpg>=0.29` (PLAN-named), justified here under ADR 004.
- New `api/card.py` (pure): the `Card` pydantic model + pure mappers `insert_values()` (digest → INSERT tuple, owns column order) and `row_to_card()` (DB record → `Card`) and `synthesize_card()` (in-memory `Card` when no DB).
- `cards` schema (`api/schema.sql`): `id uuid PK`, `url text`, `title text`, `summary text`, `key_points text[]`, `tags text[]`, `category text`, `created_at timestamptz default now()`, plus a `created_at DESC` index. `id` is generated in Python (`uuid4`) so there is no `gen_random_uuid()`/`pgcrypto` dependency on the DB. `category` carries the digest's `suggested_category`.
- `POST /api/digest` now persists the digest and returns the **full Card** (`id, url, title, summary, key_points, tags, category, created_at`, snake_case) instead of the bare digest.
- New `GET /api/cards`: all cards, newest first (`ORDER BY created_at DESC`).
- **Graceful degradation** (mirrors the OpenRouter-key-absent fallback): when `DATABASE_URL` is unset, `POST` still returns a Card (id/`created_at` synthesized, not persisted) and `GET /api/cards` returns `[]`. `DATABASE_URL` lives only in `api/.env` (gitignored) / the host environment — never the browser.

## Acceptance criteria

- GIVEN `DATABASE_URL` is set, WHEN a digest is created via `POST /api/digest`, THEN a row is inserted into `cards` and the response is the stored Card (with `id` and `created_at`).
- GIVEN cards exist, WHEN `GET /api/cards` is called, THEN it returns them newest-first.
- GIVEN the API process is restarted, THEN previously stored cards are still returned by `GET /api/cards` (persistence survives restart).
- GIVEN `DATABASE_URL` is unset, THEN `POST /api/digest` still returns a valid Card (not persisted) and `GET /api/cards` returns `[]` (the endpoints never hard-fail for lack of a DB).
- GIVEN the schema is absent on first connect, THEN `db.py` creates it idempotently (`CREATE TABLE IF NOT EXISTS`).

## Pure modules (logic — specced with pytest)

- `api/card.py` — `INSERT_COLUMNS`, `Card`, `insert_values()`, `row_to_card()`, `synthesize_card()` (`api/tests/test_card.py`, spec-first red→green). `db.py` is a thin asyncpg shell; its live path is covered by `api/tests/test_db_integration.py`, **skipped unless `DATABASE_URL` is set** (same verify-when-configured posture as the live OpenRouter call in retro 006).

## Out of scope

- Wiring the frontend `web/` to `/api` (issue #9): the `Card` response shape (snake_case, `category`) is the contract #9 consumes; reconciling it with the `web/` `Card` type (camelCase, nested `digest`, epoch-ms `createdAt`) is #9's work.
- Provisioning a specific managed Postgres / setting `DATABASE_URL` in a host; Vercel deploy (issue #10).
- Editing/deleting/moving cards, search, pagination, auth (PRD out-of-scope).

## Open questions

- None. DB posture (graceful degrade), POST response (full Card), schema setup (`schema.sql` + `CREATE IF NOT EXISTS` on first connect), and driver (`asyncpg`) all decided up front.
