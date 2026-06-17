# Retrospective 005 — Python FastAPI digest API (PLAN step 2 / issue #7)

## What we did

Stood up the `api/` package: a Python FastAPI app exposing `POST /api/digest` (+ `GET /api/health`) that extracts an article (`httpx` + `readability-lxml`) and digests it via **OpenRouter** chat-completions (default `anthropic/claude-opus-4-8`, env-swappable). First migration step off the shipped Node/Hono + Anthropic stack toward the [PLAN.md](../PLAN.md) target. Because this introduced a whole new language runtime and AI provider, governance led: ADRs were written **before** code ([ADR 004](../decisions/004-python-fastapi-backend.md) FastAPI, [ADR 005](../decisions/005-openrouter-provider.md) OpenRouter), plus a spec ([feature-005](../requirements/feature-005-fastapi-digest-api.md)). Pure modules (`schema`/`prompt`/`fallback` + `strip_html`) were spec-first with pytest (17 tests, red→green); the network layers (`extract`, `digest`, `index`) are thin shells. Response shape is **snake_case** (`key_points`, `suggested_category`) to match Python and the Postgres column model in #8.

## What worked

- **ADR-first paid off.** Asking up front (ADR sequencing, JSON casing, fallback, model) locked four decisions that would otherwise have churned the code. The "no architectural choice without an ADR" rule mapped cleanly onto issue #11's "do this early" guidance.
- **Porting `fallback.ts` → `fallback.py` 1:1** kept the PRD "works without an AI key" criterion intact and let the entire pipeline be verified with no key: `POST /api/digest` with a real Wikipedia URL went fetch → readability → deterministic digest → `Science`, and a `{text}` body produced a valid snake_case digest. Only the live OpenRouter call is unverified (no key in this env) — same posture as retro 004.
- **Mirroring the `server/` module split** (pure logic vs. thin shells) made the TS→Python translation mechanical and kept the spec-first loop honest. Error codes (400/502/500) port directly from the Hono handler.
- **Zero-dep `.env` loader** (mirrors retro 004's `process.loadEnvFile()` solution) avoided adding `python-dotenv`.

## What didn't / friction points

- **Polyglot repo now.** Two test runners (`vitest` for TS, `pytest` for `api/`). The root `npm run test:run` does not yet cover Python — documented `cd api && pytest` for now; a root pass-through can come with #9/#10.
- **System Python is 3.9.6**, Vercel's runtime is 3.12. Used `Optional[...]` (not `X | None`) and kept code 3.9-safe; worth pinning a `.python-version`/`runtime` when deploying (#10).
- **Fallback logic is now triplicated** (`app/src/digest/mockDigester.ts`, `server/src/digest/fallback.ts`, `api/fallback.py`). Acceptable across a language boundary, but the TS pair should collapse once `server/` is retired (#9/#10).

## Decisions to carry forward

- [ADR 004](../decisions/004-python-fastapi-backend.md) / [ADR 005](../decisions/005-openrouter-provider.md). `server/` (Hono) coexists until the frontend cuts over (#9) and we deploy (#10) — then retire it and its `ANTHROPIC_API_KEY`.
- Postgres ADR still owed (issue #8 / #11) — defer the "no database" constraint amendment to that step.

## Open questions for next session

- Live OpenRouter output quality is unverified until `OPENROUTER_API_KEY` is set in `api/.env`.
- `web/` currently ships only `dist/` in git (no `web/src/`) — confirm the frontend source situation before wiring #9.
