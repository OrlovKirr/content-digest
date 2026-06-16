# Retrospective 004 — Backend proxy: real fetch + Claude

## What we did

Stood up the `server/` package (Hono + `@hono/node-server`) exposing `POST /api/digest`: it extracts article text from a URL (`@extractus/article-extractor`) and digests it via Claude `claude-opus-4-8` using `messages.parse()` with a Zod schema for guaranteed-shape structured output. New deps were asked-for and recorded in [ADR 003](../decisions/003-backend-dependencies.md). The frontend swapped its mock `Digester` for an `HttpDigester` (POST `/api/digest`, Vite-proxied), keeping the client-side mock as a fallback. Spec-first on the pure server pieces (schema, prompt, normalize, fallback) and the frontend `httpDigest`; the Claude/extraction/HTTP layers are thin shells around them.

## What worked

- The `Digester` seam from Feature 002 paid off exactly as intended — swapping mock → HTTP touched only `App.tsx` and one new file; no board or digest-logic changes.
- The **fallback-when-no-key** design let me verify the entire pipeline end-to-end with no API key: in the browser, a URL-only submit went frontend → Vite proxy → Hono → real Wikipedia fetch → extraction → digest → card filed into a **Science** section. Only the live Opus call is unverified (no key in this environment); it's typechecked and wired.
- Consulting the `claude-api` skill before writing the integration got the SDK usage right first try — `messages.parse()` + `zodOutputFormat`, model id `claude-opus-4-8`, `output_config.format`+`effort` — `tsc` passed with no iteration.
- Catching the `concurrently` → `shell-quote` **critical** advisory at install time and replacing it with a zero-dep `scripts/dev.mjs` kept the dependency surface clean and the audit green.

## What didn't / friction points

- Node's `tsx` doesn't auto-load `.env`; used `process.loadEnvFile()` (Node built-in, no dep) to make `server/.env` work as documented.
- The deterministic fallback duplicates the app's mock-digest heuristics (clean package boundary vs. DRY). Flagged in ADR 003 — a shared package would justify true npm workspaces; deferred until a third package appears.
- The preview tool holds `:5173` (strictPort), so verifying `npm run dev` (which also wants 5173) required stopping the preview first. Same `:5173` contention noted in retro 003 — worth a standing note for verification sessions.

## Decisions to carry forward

- [ADR 003](../decisions/003-backend-dependencies.md). Model is a one-line constant (`server/src/digest/claude.ts`); revisit Haiku/Sonnet if Opus cost/latency bites.

## Changes made to CLAUDE.md / constraints / working agreement

- Updated CLAUDE.md current state, docs map (ADR 003, feature-004, retro 004), critical files (`server/`), and common commands (`npm run dev` runs both; `ANTHROPIC_API_KEY` in `server/.env`).
- No working-agreement changes — the spec-first loop and escalation rules held across a multi-package feature.

## Open questions for next session

- Tests cover pure logic only; the Hono handler and extraction are not integration-tested (would need a DOM/HTTP test layer → ADR). Worth it if the endpoint grows.
- Live Opus output quality is unverified until a key is configured.
