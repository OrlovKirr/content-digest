# ADR 002 — Content Digest: thin backend proxy for fetch + AI

## Context

Feature "Content Digest": a user pastes an article link; the app extracts the text, an AI produces a short summary, key points, tags, and a suggested category; the result lands as a card on a board organised into topic sections.

Two parts of this cannot run in a pure browser frontend:

1. **Article extraction** — fetching an arbitrary article URL from the browser is blocked by CORS for most sites.
2. **AI call** — summarising needs the Claude API, and an API key must never ship in browser code.

`docs/constraints.md` (from bootstrap) said "frontend only, no backend." That constraint is now in tension with the feature. The user chose to **add a thin backend proxy** rather than expose a key in the browser or rely on a public proxy.

## Decision

- Introduce a **thin backend proxy** (a new `server/` package, framework selected in the Feature 004 spec) that exposes a single endpoint:
  - `POST /api/digest` with body `{ url?: string; text?: string }` → returns a `Digest` JSON object (`summary`, `keyPoints`, `tags`, `suggestedCategory`).
- The backend owns the two key-/CORS-sensitive responsibilities: **article text extraction** and the **Claude API call**. The API key lives only in the server's environment (`.env`, gitignored).
- The frontend talks **only** to `/api/digest` — never directly to Claude or to article hosts. In dev, Vite proxies `/api` to the backend (`server.proxy`).
- The **digest contract** (`Digest` type + `Digester` interface) is defined as a pure module so the frontend, the mock, and the real server impl all conform to the same shape. The frontend depends on a `Digester` interface, not on `fetch` details — so the mock (Feature 002/003) and the HTTP-backed real impl (Feature 004) are swappable.
- **AI is mocked first** (deterministic pure logic). Real Claude wiring is deferred to Feature 004, where the model (Haiku 4.5 vs Sonnet 4.6) is chosen.
- The backend is a **proxy only** — no general-purpose application server, no database. Board state persists client-side in `localStorage`.
- A second package now exists, so npm workspaces (or a third `--prefix server` pass-through script) will be adopted when the `server/` package lands in Feature 004.

## Consequences

- Amends the "no backend" line in `docs/constraints.md`: a thin proxy is permitted **solely** for article fetching and AI calls.
- The API key stays server-side — safe for deployment, unlike a browser-key approach.
- The `Digester` seam keeps the frontend testable and key-free: Features 002–003 run entirely on the deterministic mock with no network and no secrets.
- Extra moving part in dev (a second process + Vite proxy); justified by not leaking the key.
- Article extraction quality now depends on the server's reader/readability choice — recorded as an open decision for the Feature 004 spec.
