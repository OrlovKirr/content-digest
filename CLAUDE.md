# new-project-ai

A learning playground — a sandbox to practice agentic engineering with Vite + React + TypeScript. Built spec-first, with decisions recorded as ADRs and the workflow improved via retrospectives. The governance layer (this file, `README.md`, `docs/`) is physically separated from the application code under `app/`.

## Repository layout

```
new-project-ai/                  ← repo root (git lives here)
  CLAUDE.md                      ← entry point for Claude (this file)
  README.md                      ← entry point for humans
  package.json                   ← root pass-through scripts (npm run dev runs web + api)
  scripts/dev.mjs                ← zero-dep launcher for both dev servers
  .gitignore .editorconfig .nvmrc .env.example
  docs/                          ← requirements / decisions / retrospectives / constraints
  app/                           ← Vite + React + TS frontend (legacy, ADR 002/003 stack)
  server/                        ← thin Hono backend proxy (fetch + Claude), legacy
  web/                           ← Vite + React + TS frontend (new ADR 004 stack)
  api/                           ← FastAPI on Vercel (planned, PLAN step 2)
```

Governance files live at the repo root and **never** inside a package. Application code lives inside a package (`web/`, `api/`, or the legacy `app/`/`server/` during migration), **never** loose at the repo root. See [ADR 004](docs/decisions/004-new-stack-fastapi-vercel.md) for the migration.

## How to work in this repo

> **Working agreement**
>
> 1. No code without a spec. Every feature begins as a file under `docs/requirements/` (at repo root) and a failing test under `app/src/**/*.spec.ts(x)`.
> 2. No architectural choice without an ADR under `docs/decisions/`.
> 3. Read `docs/constraints.md` before proposing anything new. Surface conflicts, don't silently comply.
> 4. The loop is: spec → failing test → minimal code → green test → commit. One concern per commit.
> 5. Logic in pure modules, rendering in components. Specs target the logic. Add a DOM-testing layer (e.g. React Testing Library) only via an ADR when a real need appears.
> 6. When in doubt, ask. Use AskUserQuestion rather than guessing requirements.
> 7. Keep `CLAUDE.md`'s "Current state" section updated after every merged change.
> 8. Dev server lives at `http://127.0.0.1:<DEV_PORT>/` where `DEV_PORT` is recorded in `.dev-port` (defaults to 5173, probed for a free port at bootstrap time). Always read the current port from `.dev-port` instead of hardcoding 5173. `strictPort: true` is set so Vite never silently drifts.
> 9. **Retrospective after every feature.** Once a feature is green and committed, write `docs/retrospectives/NNN-<slug>.md` capturing what worked, what didn't, and concrete workflow changes. If the retro proposes a change, **edit `CLAUDE.md` (working agreement, constraints, or links) in the same session** — don't defer. Add a new ADR if the change is architectural. Then update the "Self-improvement log" section to link the new retro. Commit as `chore(retro): NNN-<slug>`.
> 10. **Layout discipline.** Governance files (`CLAUDE.md`, `README.md`, `docs/**`) live at the repo root. Application code lives inside `app/` (frontend) or `server/` (backend proxy), never loose at the repo root. Root-level config and small launcher scripts (`scripts/`, CI, dotfiles) are allowed; package code at root is not.
> 11. **Conventional Commits.** Format: `<type>(<scope>): <subject>`. Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `style`. Retros are committed as `chore(retro): NNN-<slug>`. ADR additions as `docs(adr): NNN-<slug>`.
> 12. **CLAUDE.md ≤ ~200 lines.** It is a router, not an encyclopedia. If a retro update would push it past ~200 lines, move detail into a linked file under `docs/` and link from `CLAUDE.md` instead. Same applies to constraints.md — split into topical files once over ~150 lines.

## Documentation map

- [docs/PRD.md](docs/PRD.md) — product requirements: problem, scenarios, scope, MVP criteria
- [docs/PLAN.md](docs/PLAN.md) — forward-looking target stack + build steps (diverges from ADR 002/003)
- [docs/requirements/overview.md](docs/requirements/overview.md) — goal, user, success criteria
- [docs/requirements/feature-001-hello-world.md](docs/requirements/feature-001-hello-world.md) — Feature 001 spec
- [docs/requirements/feature-002-digest-pipeline.md](docs/requirements/feature-002-digest-pipeline.md) — Feature 002 spec (mock digest pipeline)
- [docs/requirements/feature-003-board.md](docs/requirements/feature-003-board.md) — Feature 003 spec (board + sections)
- [docs/requirements/feature-004-backend-claude.md](docs/requirements/feature-004-backend-claude.md) — Feature 004 spec (backend + Claude)
- [docs/requirements/feature-005-web-shell.md](docs/requirements/feature-005-web-shell.md) — Feature 005 spec (web/ shell, PLAN step 1)
- [docs/decisions/001-agent-structure.md](docs/decisions/001-agent-structure.md) — ADR: root-vs-`app/` split
- [docs/decisions/002-content-digest-architecture.md](docs/decisions/002-content-digest-architecture.md) — ADR: Content Digest thin backend proxy (superseded by 004)
- [docs/decisions/003-backend-dependencies.md](docs/decisions/003-backend-dependencies.md) — ADR: backend deps (Hono, Anthropic SDK, extractor; Opus 4.8) (superseded by 004)
- [docs/decisions/004-new-stack-fastapi-vercel.md](docs/decisions/004-new-stack-fastapi-vercel.md) — ADR: adopt FastAPI/Vercel/Postgres/OpenRouter (supersedes 002/003)
- [docs/constraints.md](docs/constraints.md) — what NOT to do
- [docs/retrospectives/](docs/retrospectives/) — self-improvement log (see below)

## Current state

**Content Digest** is the app. Paste an article URL (or text) → a backend fetches + extracts the article and digests it → summary, key points, tags, suggested category → the result lands as a card on a **board with sections by topic**.

**Stack migration in progress (ADR 004, issues #6–#11).** The repo is moving from the shipped stack — `app/` frontend + `server/` (Hono) backend + Claude + `localStorage` (Features 001–004) — to the target in [PLAN.md](docs/PLAN.md): `web/` frontend + `api/` (Python FastAPI on Vercel) + Postgres + OpenRouter. [ADR 004](docs/decisions/004-new-stack-fastapi-vercel.md) supersedes ADR 002/003 and the "no DB" constraint. **Step 1 (issue #6) shipped:** the `web/` shell — paste form + topic board + card, rendered from static placeholder data, **no API and no storage yet**. The legacy `app/`+`server/` remain canonical and runnable until the deploy step removes them; `web/` is the new frontend being built out.

**Ports:** legacy `app/` 5173 / `server/` 8787; new `web/` dev 5174 / preview 4174 (`strictPort`). `web/` takes 5173/4173 once `app/` is removed.

## Dev server

From the repo root: `npm run dev` starts **both** servers — Vite frontend on `http://127.0.0.1:5173/` and the Hono backend on `:8787` (Vite proxies `/api` → `:8787`). To enable real Claude digests, copy `server/.env.example` → `server/.env` and set `ANTHROPIC_API_KEY`; without it the backend uses the deterministic fallback.

## Common commands

All from the repo root:

- `npm run dev` — start frontend + backend together (zero-dep `scripts/dev.mjs`)
- `npm run dev:web` / `npm run dev:server` — start just one
- `npm run build` — type-check and build the frontend for production
- `npm run test:run` — run vitest once across `app/` + `server/` (CI mode)
- `npm run typecheck` — `tsc --noEmit` for `server/`
- `npm run lint` — eslint (app); `npm run format` — prettier --write
- `npm run setup` — install deps for both packages

## Critical files

- [app/vite.config.ts](app/vite.config.ts) — dev/preview ports, `strictPort`, `/api` proxy, `@` path alias
- [app/src/digest/httpDigester.ts](app/src/digest/httpDigester.ts) — frontend → `/api/digest`, with mock fallback
- [server/src/server.ts](server/src/server.ts) — Hono app (`POST /api/digest`)
- [server/src/digest/claude.ts](server/src/digest/claude.ts) — Claude call + model id (one-line swap)
- [docs/constraints.md](docs/constraints.md) — guardrails

## Self-improvement log

Retrospectives live under [docs/retrospectives/](docs/retrospectives/):

- [001-hello-world.md](docs/retrospectives/001-hello-world.md) — bootstrap + Feature 001
- [002-digest-pipeline.md](docs/retrospectives/002-digest-pipeline.md) — mock digest pipeline
- [003-board.md](docs/retrospectives/003-board.md) — board with topic sections
- [004-backend-claude.md](docs/retrospectives/004-backend-claude.md) — backend proxy + real fetch/Claude
- [005-web-shell.md](docs/retrospectives/005-web-shell.md) — web/ shell + ADR 004 stack migration (PLAN step 1)

## Escalation rules

> Stop and ask via AskUserQuestion when:
> - The same test has failed 3 times with different fixes (you're guessing — get more context).
> - A request conflicts with `docs/constraints.md` or a rule in the "Rules" section of `CLAUDE.md` (surface it, don't silently comply).
> - A new runtime dependency is needed (ask + add an ADR before installing).
> - `:5173` or `:4173` is taken (fix the conflict, do not let Vite drift to another port).
> - This change would push `CLAUDE.md` past ~200 lines (route detail into a linked doc first).
> - Acceptance criteria in a `docs/requirements/feature-*.md` are ambiguous or contradict each other.

## Rules

> **TypeScript strict:** Do NOT disable `strict`, `noImplicitAny`, `strictNullChecks`, or `noUncheckedIndexedAccess` in any `tsconfig*.json`. Narrow the type or guard the value — never loosen the config.
>
> **Pure modules:** Business logic lives in pure modules under `app/src/`. React components only render — no branching/transform logic. Extract any non-trivial computation into a pure module and spec it before wiring it in.
>
> **Spec first:** Every new module starts with a failing `*.spec.ts(x)` test. Show the red output, then write the minimum code to turn it green, then commit.
