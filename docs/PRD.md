# PRD — Content Digest

## Problem

People save more articles than they ever revisit. Links pile up in tabs, notes apps, and "read later" queues with no structure — by the time you come back, you've forgotten why you saved them and can't tell the pile apart. Reading each one again to triage is too expensive, so the backlog just grows.

## Who it's for

Curious readers who collect articles faster than they read them — students, researchers, and knowledge workers who want the gist and a way to organize reading by topic without manual note-taking.

## How it works (core scenarios)

1. **Paste a link → get a digest.** The user pastes an article URL; the app fetches and extracts the text, and an AI produces a short **summary**, a few **key points**, topic **tags**, and a **suggested category**.
2. **Paste text directly.** If a URL can't be fetched (paywall, login), the user pastes the article text instead and gets the same digest.
3. **Card on a topic board.** Each digest becomes a **card** that lands on a **board organized into sections by category** (Technology, Business, Science, Health, Culture, Other).
4. **Scan and persist.** The user scans cards by topic across visits — the board persists locally between sessions.

## In scope (MVP)

- URL fetch + article-text extraction (server-side).
- AI digest: summary, key points, tags, suggested category from a fixed taxonomy.
- Board with topic sections; one card per digested article; newest-first within a section.
- Local persistence (`localStorage`); clear-board action.
- Works without an AI key via a deterministic fallback digest (degraded but functional).

## Out of scope (for now)

- Accounts, auth, multi-device sync, sharing.
- A server-side database — the board lives in the browser.
- Editing digests, moving cards between sections, manual re-categorization.
- Search, full-text storage of articles, tag filtering, bulk import.
- Browser extension / mobile app.

## MVP success criteria

- Pasting a valid article URL yields a card with a non-empty summary, 1–5 key points, 1–5 tags, and a category from the taxonomy — in a single action.
- The card is filed under the section matching its suggested category.
- Cards survive a page reload.
- With no AI key configured, the same flow still produces a card (via the fallback).
- A first-time user can go from pasted link to a filed card without instructions.

## References

- [requirements/overview.md](requirements/overview.md) — goal, user, success criteria
- [constraints.md](constraints.md) — guardrails (amended by ADR 002 for the thin backend)
- [decisions/002-content-digest-architecture.md](decisions/002-content-digest-architecture.md) · [decisions/003-backend-dependencies.md](decisions/003-backend-dependencies.md)
