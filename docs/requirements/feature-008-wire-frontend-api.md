# Feature 008 — Wire frontend ↔ `/api` (submit → digest → card, load from server)

> PLAN step 4/5 ([PLAN.md](../PLAN.md)), GitHub issue #9. Architecture: [ADR 004](../decisions/004-new-stack-fastapi-vercel.md). Connects the `web/` shell (#6) to the `api/` service that #7 (digest) and #8 (Postgres persistence + `GET /api/cards`) already shipped. **Backend-complete already** — this feature is the frontend half only.

## User story

As a user, I paste an article URL (or text) and click **Digest**; a card is created and filed under its category on the board in one action. When I reload, the board shows the cards the server has.

## Architecture

- `web/src/lib/api.ts` — the single boundary between the browser and `/api`. Exposes `postDigest({ url, text }) → Card` and `getCards() → Card[]`, owns the **wire ↔ domain** mapping, and turns transport/HTTP failures into friendly `Error` messages. A pure `cardFromWire()` helper does the field/casing mapping and is unit-tested.
- The wire shape is **already fixed by #8**: `POST /api/digest` and `GET /api/cards` both return a Card — `{ id, url, title, summary, key_points[], tags[], category, created_at }` (snake_case; `created_at` an ISO 8601 string from the `timestamptz` column). `cardFromWire` maps it to the frontend's camelCase `Card`/`Digest` (`keyPoints`, `suggestedCategory`, `createdAt` epoch ms), narrowing `category` to the taxonomy.
- `App` loads the board from `GET /api/cards` on mount and prepends the card returned by `POST /api/digest`. `DigestForm` submits asynchronously: disabled + "Digesting…" in flight, keeps the input and shows the error inline on failure.
- Dev wiring: `web/vite.config.ts` proxies `/api` → the FastAPI app on `http://127.0.0.1:8788`. New root scripts (`dev:web-new`, `dev:api-new`, `dev:new`) run the new pair; the legacy `app/`+`server/` scripts are untouched and remain canonical until cutover (#10).

## Acceptance criteria

- GIVEN a pasted URL or text, WHEN I submit, THEN `POST /api/digest` is called, a card is returned, and it appears in its category section without a reload.
- GIVEN the board loads, THEN it fetches `GET /api/cards` and renders the cards grouped by category, newest first.
- GIVEN a `DATABASE_URL` is configured, THEN reloading shows previously created cards (durability is #8's concern; this feature relies on it). With no `DATABASE_URL`, the API still returns a card from `POST` and `[]` from `GET` (graceful degrade, per #8) — the board stays functional within the session.
- GIVEN an empty form (no url, no text), THEN the client blocks submit with an inline message and does not call the API.
- GIVEN extraction (`502`) or a digest/persistence failure (`500`/network), THEN the board surfaces a clear, human-readable error and stays usable.
- WHILE a digest is in flight, THEN the submit button is disabled and shows progress; the form re-enables on success or error.
- The OpenRouter API key and `DATABASE_URL` never reach the browser.

## Pure modules (logic — specced first)

- `web/src/lib/api.ts` — pure `cardFromWire(raw) → Card` mapper (casing + `created_at` ISO → epoch ms + category narrowing); the `fetch` wrappers are thin shells specced with a mocked `fetch` (`api.spec.ts`).

## Relationship to #7 / #8 (history)

- #7 built `POST /api/digest` (digest only). #8 changed it to **build, persist, and return a full Card** and added `GET /api/cards` (`api/card.py`, `api/db.py`, `api/schema.sql`). This feature consumes that contract unchanged — **no backend code is added here.**
- This work was originally drafted assuming #8 was unbuilt (with a temporary in-memory store); #8 landed in parallel with the real Postgres backend, so the draft's backend was dropped and the frontend rebased onto #8. See [retro 008](../retrospectives/008-wire-frontend-api.md).

## Out of scope

- Any backend/persistence change (owned by #7/#8); Vercel deploy (#10); retiring `app/`+`server/` (#10 cutover).
- Editing/moving/deleting cards, auth, search (PRD out-of-scope).

## Open questions

- None. Scope (frontend wiring onto #8's backend) and dev wiring (proxy + new root scripts) confirmed with the requester.
