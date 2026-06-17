# Retrospective 007 — Postgres persistence (PLAN step 3 / issue #8)

## What we did

Added server-side persistence to the `api/` package under [ADR 004](../decisions/004-new-stack-fastapi-vercel.md) (no new ADR — ADR 004 already authorises the Postgres category and the one-table schema). New `api/db.py` (thin `asyncpg` shell: lazy process-wide pool, idempotent schema init from `api/schema.sql`, insert/fetch over one `cards` table), `api/card.py` (pure `Card` model + `insert_values`/`row_to_card`/`synthesize_card` mappers, spec-first with `test_card.py`, red→green), and `api/schema.sql` (`id uuid PK`, `key_points`/`tags` as `text[]`, `created_at timestamptz`, `created_at DESC` index). `POST /api/digest` now persists and returns the **full Card**; new `GET /api/cards` returns cards newest-first. New runtime dep `asyncpg>=0.29` (PLAN-named). 24 pytest pass + 1 `DATABASE_URL`-gated integration test skipped.

## What worked

- **Deciding the four underspecified points up front via AskUserQuestion** (DB-absent posture, POST response shape, schema setup, driver) locked the contract before any code — no churn. Mirrors retro 006's "deciding up front" win.
- **The pure/shell split paid off again.** All shaping logic (column order, row→Card, digest→Card) lives in pure `card.py` and was spec-tested with no DB; `db.py` is a thin asyncpg shell. The pure suite (and the whole existing suite) runs with no Postgres and — because `asyncpg` is imported only inside `db.py` — even without `asyncpg` installed.
- **Graceful degradation as a first-class path**, copied from the OpenRouter-key-absent fallback: `insert_card` synthesizes an in-memory Card when `DATABASE_URL` is unset, so `POST /api/digest` keeps a stable Card contract and the endpoints never hard-fail for lack of a DB. Let the full no-DB flow be verified live (health `database:false`, POST→Card, GET→`[]`, empty→400).
- **Generating `id` in Python (`uuid4`)** removed any `gen_random_uuid()`/`pgcrypto` dependency on the database, so `schema.sql` runs on a bare Postgres with no extensions — one less host assumption for Vercel/#10.
- **Driving the integration test with `asyncio.run()` in a sync test** avoided adding `pytest-asyncio` just to gate one skipped test — same zero-extra-dep instinct as retro 006's `.env` loader.

## What didn't / friction points

- **No Postgres in this environment** (no `DATABASE_URL`, no `psql`). The live-DB path (insert/fetch/restart-survival, acceptance criteria 1–3) is wired but **unverified here** — exactly retro 006's posture for the live OpenRouter call. The `DATABASE_URL`-gated `test_db_integration.py` is the mechanism to verify it the moment a URL exists; restart-survival should be checked by hand against a real instance during #9/#10.
- **The response contract diverged from `web/`'s `Card` type.** The API returns snake_case with `category` and a nested-free flat shape + ISO `created_at`; `web/src/board/types.ts` expects camelCase, a nested `digest`, and epoch-ms `createdAt`. Deliberately left for #9 (the wiring step owns reconciliation), but it's a real seam to watch.
- **`schema.py`'s `DigestResponse`/`DigestInput`/`DigestRequest` are now fully unused** — `DigestResponse` was the old POST return type, the other two were already dead. Left as documentation-only rather than an unscoped removal; **collapse them when #9 settles the final response contract.**

## Decisions to carry forward

- Persistence is server-owned and **degrades gracefully without `DATABASE_URL`**; keep that posture through deploy so dev/CI never require a live DB.
- `id` is app-generated (uuid4); `schema.sql` assumes no DB extensions. Keep it that way for portability.
- #9 owns the `Card` shape reconciliation between `api/` (snake_case/flat) and `web/` (camelCase/nested) and should retire the now-dead `schema.py` models as part of settling that contract.

## Open questions for next session

- Live Postgres verification (insert/fetch/restart) pending a real `DATABASE_URL`.
- Root `npm run test:run` still doesn't cover the Python suite; a pass-through is still deferred to #9/#10 (unchanged from retro 006).
- Connection-pool sizing for Vercel serverless (`min_size=0, max_size=5`) is a guess — revisit against real cold-start behaviour at deploy (#10).
