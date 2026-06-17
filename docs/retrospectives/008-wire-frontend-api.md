# Retrospective 008 — Wire frontend ↔ `/api` (PLAN step 4 / issue #9)

## What we did

Wired the `web/` board to the `api/` service end to end. Added `web/src/lib/api.ts` (typed `postDigest`/`getCards` + a pure, spec-first `cardFromWire` mapper from the snake_case Card wire shape to the camelCase domain `Card`). `App` loads the board from `GET /api/cards` on mount and prepends the card returned by `POST /api/digest`; `DigestForm` went async (disabled + "Digesting…" in flight, keeps input and shows the error inline on failure). Added the `/api` → `:8788` Vite proxy and root scripts `dev:new`/`dev:web-new`/`dev:api-new`. **No backend code** — #8 had already shipped the persistence + `GET /api/cards` this consumes.

## What didn't / friction points — and the big one

- **#8 landed in parallel and collided head-on. This is retro 006's warning coming true.** This feature was drafted against base `b7e1638` on the assumption that #8 (Postgres + `GET /api/cards`) was *unbuilt*, so it included a temporary in-memory `store.py` + `build_card`/`CardResponse` + its own `GET /api/cards`, and was even **numbered 007**. Mid-flight, **#8 merged to `main` as PR #13** — real Postgres (`db.py`/`card.py`/`schema.sql`), a card-returning `POST`, `GET /api/cards`, *and its own `007` feature/retro docs and `api/tests/test_card.py`*. The PR was unmergeable; the entire backend half was redundant and would have **regressed Postgres to in-memory** if forced.
  - **Resolution:** rebased onto `origin/main`, **dropped the redundant backend**, kept only the frontend + dev scripts, **renumbered 007 → 008**, and reconciled `CLAUDE.md`. The frontend needed *zero* change to its logic: the Card wire shape I'd designed for the in-memory placeholder was byte-for-byte what #8's Postgres backend emits, so `cardFromWire` and the components dropped straight onto the real backend.
  - **Lesson (sharper than retro 006's):** retro 006 said "fetch and check `origin` numbering before starting." That wasn't enough — #8 and #9 were *active in the same window*. For dependency-linked issues, **`git fetch` and re-check the dependency's status right before starting AND before pushing**, and prefer designing the seam as a contract (which saved us here) over building a placeholder implementation of someone else's issue. Designing `web/`'s expectations as the *shared wire contract* is what made the collision a rename-and-drop instead of a rewrite.
- **`preview_fill` + `preview_click` don't drive React controlled inputs** — setting `.value` doesn't fire `onChange`, so state stayed empty and the empty-input guard silently no-op'd the submit (no POST, looked like a bug in my code). **Fix that worked:** drive inputs via `preview_eval` with the native-setter + `dispatchEvent(new Event('input',{bubbles:true}))` trick and submit via `form.requestSubmit()`.
- **`preview_screenshot` rendered a 1px sliver** for this page regardless of `preview_resize`; the accessibility **snapshot** / `eval` reading `innerText` were the reliable proof.
- **eslint has no `^_` argsIgnorePattern**, so throwaway params still error — typed the vitest mock via `vi.fn<(...)=>...>()` instead of naming params.

## What worked

- **Contract-first seam** turned a parallel-work collision into a trivial rebase (see above) — the single most valuable decision this session.
- **Mapping isolated in one pure function** (`cardFromWire`); the React glue needed no logic tests. Spec-first held: vitest red→green for `api.ts`, then wiring.
- **Browser-verified against #8's real backend** on the no-`DATABASE_URL` (graceful-degrade) path: board loads, submit → card filed under its category, and a forced extraction failure showed a clear inline error with the board intact.

## Decisions to carry forward

- The **Card wire contract** (`{ id, url, title, summary, key_points, tags, category, created_at }`) is shared by `web/` and `api/`; both #8 and #9 honour it.
- Legacy `app/`+`server/` remain canonical/runnable until the #10 cutover; the new pair runs via `dev:new`.

## Open questions for next session

- Cross-restart durability needs a real `DATABASE_URL` (verified only on the degrade path here); the live-DB path is covered by #8's `DATABASE_URL`-gated integration test.
- Live OpenRouter output remains unverified without `OPENROUTER_API_KEY`.
- Deploy (#10): `vercel.json`, a `.python-version`/runtime pin, and a unified root test/dev story across `web/` + `api/`.

## Workflow change applied this session

- Updated retro 006's numbering rule: for **dependency-linked** issues, re-check the dependency's merge status at *start and at push*, and build against the shared contract rather than a placeholder of the dependency. Reflected in this retro; `CLAUDE.md` "Current state", docs map, commands, critical files, and log updated for #9 shipping.
