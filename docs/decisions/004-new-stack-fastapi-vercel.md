# ADR 004 — Adopt the FastAPI / Vercel / Postgres / OpenRouter stack

> **Status: accepted.** Supersedes [ADR 002](002-content-digest-architecture.md) and
> [ADR 003](003-backend-dependencies.md), and amends [constraints.md](../constraints.md)
> (the "no database" line and the "no app code outside `app/`" line). Realises the target
> described in [PLAN.md](../PLAN.md).

## Context

The shipped app (Features 001–004) runs on a Node/Hono backend that proxies article
extraction and a **Claude (Anthropic)** digest call, with board state in the browser's
`localStorage` and the frontend living under `app/`. That stack is recorded in ADR 002
(thin backend proxy) and ADR 003 (Hono + Anthropic SDK + extractor, Opus 4.8).

[PLAN.md](../PLAN.md) sets a different target and the repo owner has scheduled the migration
as issues #6–#11. The new stack is:

| Layer | Was (ADR 002/003) | Now (this ADR) |
|---|---|---|
| Frontend | `app/` (Vite + React + TS) | `web/` (Vite + React + TS) |
| API | `server/` Node + Hono | `api/` Python **FastAPI**, Vercel serverless |
| AI | Anthropic Claude (Opus 4.8) | **OpenRouter** (chat completions) |
| Storage | browser `localStorage` | **Postgres** (server-side `cards` table) |
| Hosting | local dev only | **Vercel** (static `web/` + Python `/api`) |

The migration motivations: server-side persistence (cards survive across devices/clears),
a single deploy target (Vercel) for both the static frontend and the API, and provider
flexibility via OpenRouter. The frontend contract is unchanged in spirit: the browser talks
only to `POST /api/digest` and holds no secrets.

PLAN.md flagged that adopting it **supersedes ADR 002/003 and the "no database" constraint,
each via a new ADR**. This is that ADR, landed first (issue #11's substance) so the rest of
the migration (issues #6–#10) proceeds on a legitimate governance footing.

## Decision

- **Adopt the PLAN.md stack**: `web/` (frontend) + `api/` (FastAPI on Vercel) + Postgres +
  OpenRouter, hosted on Vercel. The folder layout in [PLAN.md](../PLAN.md) is authoritative.
- **Supersede ADR 002 and ADR 003.** The Node/Hono `server/` and the Anthropic SDK are no
  longer the target backend. They remain in the tree during the migration and are removed at
  the deploy step (issue #10/#5) once `api/` reaches parity — not deleted speculatively now.
- **Amend `constraints.md`:**
  - The "no database" line is lifted — a single Postgres `cards` table is permitted (schema
    in PLAN.md §Data model). No ORM and no general-purpose schema beyond that one table.
  - "No app code outside `app/`" becomes "no app code loose at the repo root"; application
    code lives under `web/` (frontend) **or** `api/` (backend), and during the migration also
    the legacy `app/` and `server/`. Governance files stay at the repo root.
- **Frontend contract unchanged**: the browser calls only `POST /api/digest` (and later
  `GET /api/cards`); the OpenRouter key and `DATABASE_URL` live only in the API's environment.
- **Build it in PLAN.md's five steps**, one issue each (#6 shell → #7 digest API →
  #8 persistence → #9 wire-up → #10 deploy). Step 1 (this work, issue #6) is the `web/` shell
  with placeholder data and **no API and no client storage yet**.
- **Coexistence during migration**: `web/` runs on a distinct dev port (5174 / preview 4174,
  `strictPort`) so the legacy `app/` (5173) can still run side-by-side for reference. When
  `app/` is removed at the deploy step, `web/` takes the canonical 5173/4173.

## Consequences

- New runtime dependencies arrive per step under their own specs/issues (FastAPI, httpx,
  asyncpg, an OpenRouter client). Each is justified in the relevant feature spec; this ADR
  authorises the categories, not specific pins.
- Secrets move from `ANTHROPIC_API_KEY` (Claude) to `OPENROUTER_API_KEY` + `DATABASE_URL`,
  set in Vercel env (and `.env` locally, gitignored). `.env.example` is updated as those
  steps land.
- Persistence semantics change: cards are server-owned, so "Clear board" and reload behave
  differently than the `localStorage` version. The board shell (step 1) renders placeholder
  data only; real load/clear semantics are defined in issues #8–#9.
- The Python `api/` introduces a second language to the repo; the spec-first / one-concern
  -per-commit discipline still applies (pytest for `api/`, vitest for `web/`).
- Until the deploy step, the tree carries two frontends and two backends. This is deliberate
  and time-boxed to the migration; CLAUDE.md "Current state" tracks which is canonical.
