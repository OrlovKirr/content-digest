# Feature 003 — Digest board with topic sections

## User story

As a user, I want each digested article to land as a **card** on a **board organised into sections by topic (category)**, persisted across reloads, so I can collect and scan my reading by theme.

## Scope

- Input form: an article **URL** (optional reference for now — auto-fetch arrives in Feature 004) and a **text** area to paste the article body. Submitting runs the (mock) digester.
- Each result becomes a **card**: title, source URL, category badge, summary, key points, tags.
- The board groups cards into **sections by `suggestedCategory`**, in taxonomy order, omitting empty sections. Within a section, newest card first.
- Board state persists in `localStorage` and reloads on start. A "Clear board" action empties it.

## Pure modules (logic — specced)

- `board/title.ts` → `deriveTitle({ url?, text })`: a human title from the URL slug, else the first sentence (truncated), else `Untitled`.
- `board/group.ts` → `sectionsFromCards(cards)`: `Section[]` (`{ category, cards }`) in `CATEGORIES` order, non-empty only, cards newest-first.
- `board/storage.ts` → `serializeBoard` / `deserializeBoard` (pure, validating) + thin `loadBoard` / `saveBoard` localStorage wrappers.

## Acceptance criteria

- GIVEN pasted text and a URL WHEN I submit THEN a card appears in the section matching the digest's category.
- GIVEN cards across several categories THEN the board shows one section per non-empty category, in taxonomy order, each card under its category.
- GIVEN a reload THEN previously added cards are still present (localStorage).
- GIVEN empty text WHEN I submit THEN the form shows a validation message and adds nothing.
- GIVEN a malformed/old localStorage value THEN the board loads as empty rather than crashing.

## Out of scope

- Auto-fetching article text from the URL (Feature 004, server-side).
- Real Claude AI (Feature 004).
- Editing/moving cards between sections, search, drag-and-drop.

## Open questions

- None.
