# Retrospective 003 — Digest board with topic sections

## What we did

Built the board UI on top of the mock digester: pure modules `deriveTitle`, `sectionsFromCards`, and `serializeBoard`/`deserializeBoard` (all specced), thin React components (`DigestForm`, `BoardView`, `CardView`, `CategoryBadge`), and `App` wiring state + `localStorage` persistence. Verified end to end in the browser via the preview tool: two articles of different topics produced cards that filed into separate **Technology** and **Business** sections, and survived a reload.

## What worked

- Keeping logic in pure modules and components as thin renderers meant 22 specs cover grouping, titling, and storage with **no DOM-testing layer** needed — working-agreement rule 5 held; no RTL ADR required.
- The defensive `deserializeBoard` (tolerates malformed/stale JSON → `[]`) is the kind of guard that prevents a future schema bump from bricking the board; it has a spec.
- Browser verification with the preview MCP caught nothing broken but gave real confidence the user's core ask (paste → card → topic section → persists) actually works.

## What didn't / friction points

- The preview tool roots at the workspace parent, not the repo subfolder, so its `.claude/launch.json` had to live one level up and use `npm --prefix new-project-ai/app run dev`. It also refused to reuse our hand-started dev server (port-in-use), so the manual server had to be stopped first. Noted for future verification sessions.
- The Vite template's default `index.css` is dark-themed; the cards are light. It looks intentional (light cards on a dark board) but a deliberate theme pass is deferred.
- URL auto-fetch is still stubbed — users must paste text. This is the explicit Feature 004 boundary, signposted in the form placeholder.

## Decisions to carry forward

- No new ADR. Feature 004 will stand up the `server/` package per ADR 002 and swap `createMockDigester()` for an HTTP-backed `Digester`.

## Changes made to CLAUDE.md / constraints / working agreement

- Updated CLAUDE.md "Current state" to describe the Content Digest board, and the documentation map + self-improvement log.
- No working-agreement or constraint changes — the loop held.

## Open questions for next session

- Feature 004: pick the server framework (e.g. Hono vs Node http) and the article extractor (reader service vs readability lib), and the model (Haiku 4.5 vs Sonnet 4.6).
