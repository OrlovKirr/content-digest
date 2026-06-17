# Feature 005 — Web shell (paste form + topic board, placeholders)

> PLAN step 1 of 5 (issue #6). First feature on the [ADR 004](../decisions/004-new-stack-fastapi-vercel.md) stack: scaffold `web/` and build the UI shell with **no API and no client storage yet**.

## User story

As a user, I can open the app, see a paste form (article URL **or** text) with basic validation, and see a topic board of placeholder cards grouped into sections by category — so the shape of the product is clear before any backend exists.

## Scope

- New `web/` package: Vite + React + TypeScript, **strict** (same `tsconfig` rigor as `app/`: `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`; no `baseUrl`).
- **Paste form**: a URL input and a text area. Submitting validates that **at least one** of URL/text is non-empty; empty → inline validation message, nothing added. Because there is no API yet, a valid submit shows a neutral "not wired yet" notice rather than producing a card.
- **Topic board**: sections per category in taxonomy order (`Technology, Business, Science, Health, Culture, Other`), empty sections omitted, newest card first within a section.
- **Card component**: title, source URL (when present), category badge, summary, key points, tags.
- **Placeholder data**: a static set of cards spanning several categories, seeded into the board.

## Pure modules (logic — specced)

- `board/group.ts` → `sectionsFromCards(cards)`: `Section[]` in `CATEGORIES` order, non-empty only, cards newest-first. (Ported from `app/`.)
- `board/title.ts` → `deriveTitle({ url?, text })`: human title from URL slug, else first sentence (truncated), else `Untitled`. (Ported from `app/`; used by later steps and specced now.)
- `board/placeholders.ts` → `PLACEHOLDER_CARDS`: valid `Card[]` spanning ≥3 categories, used to seed the board shell.

## Acceptance criteria

- GIVEN the app running locally (`npm --prefix web run dev`) THEN the page renders the header, the paste form, and the board.
- GIVEN the board WHEN it loads THEN it shows the placeholder cards grouped into one section per non-empty category, in taxonomy order, each card under its category.
- GIVEN empty URL and empty text WHEN I submit THEN an inline validation message appears and no card is added.
- GIVEN a non-empty URL or text WHEN I submit THEN a neutral notice explains the digest API arrives in step 2 — **no network request is made**.
- The production build (`tsc -b && vite build`) and the test suite (`vitest run`) pass under strict TypeScript.

## Out of scope

- Any backend call, OpenRouter, extraction, or `lib/api.ts` wiring (PLAN steps 2 & 4).
- Postgres persistence and `GET /api/cards` (step 3).
- Removing the legacy `app/` / `server/` packages (deploy step).
- Editing/moving cards, search, drag-and-drop.

## Open questions

- None.
