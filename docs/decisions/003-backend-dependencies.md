# ADR 003 — Feature 004 backend: framework, extractor, model, dependencies

## Context

[ADR 002](002-content-digest-architecture.md) committed to a thin backend proxy (`POST /api/digest`) that owns article-text extraction and the Claude call, keeping the API key server-side. Feature 004 builds it. The escalation rule in `CLAUDE.md` ("a new runtime dependency is needed → ask + add an ADR before installing") applies: the backend needs several new dependencies. The user was asked and chose the model and extractor; framework was left to recommendation.

## Decision

A new `server/` package (Node + TypeScript), wired into the root via `npm --prefix server` pass-through scripts (consistent with `app/`; true npm workspaces deferred until a third package or shared code appears).

New runtime dependencies (all in `server/`, none in `app/`):

| Dependency | Role | Why |
| --- | --- | --- |
| `hono` + `@hono/node-server` | HTTP framework | Tiny, modern, TypeScript-first; clean routing for the single `/api/digest` endpoint (user: no preference → recommended). |
| `@anthropic-ai/sdk` | Claude client | Official SDK; `messages.parse()` + a Zod schema gives guaranteed-shape structured output. |
| `zod` | Schema | Defines and validates the `Digest` shape for structured output and request bodies. |
| `@extractus/article-extractor` | Article extraction | Fetches page HTML and returns clean title + text server-side; no third-party reader service (user choice). |

Dev dependencies: `tsx` (run TS directly), `typescript`, `vitest`. Root adds `concurrently` (dev) to run web + api together.

**Model:** `claude-opus-4-8` (user choice). Called via `messages.parse()` with `output_config.effort: "medium"` and a Zod `Digest` schema. The model id is a single constant (`server/src/digest/claude.ts`) so it is a one-line swap.

**Graceful degradation:** when `ANTHROPIC_API_KEY` is unset, the backend falls back to a deterministic local digest so the app runs in dev with no key. The real Opus path activates automatically when the key is present.

**Dev wiring:** Vite proxies `/api` → the Hono server (`http://127.0.0.1:8787`). The frontend's `Digester` becomes an `HttpDigester` that POSTs to `/api/digest`; if the backend is unreachable it falls back to the existing client-side mock, so the board stays usable standalone.

## Consequences

- The API key never reaches the browser (the ADR 002 goal). `server/.env` is gitignored.
- The frontend is unchanged behind the `Digester` interface — only the concrete implementation swaps (mock → HTTP).
- Two dev processes now (`npm run dev` runs both via `concurrently`). Vite still owns `:5173`; Hono owns `:8787`.
- Opus 4.8 is pricier than Haiku/Sonnet for short digests; acceptable per user choice and trivially swappable.
- Minor duplication: the server has its own deterministic fallback rather than importing `app/src/digest` (clean package boundary; a shared package would justify workspaces later).
