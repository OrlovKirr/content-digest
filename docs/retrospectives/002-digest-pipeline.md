# Retrospective 002 — Digest pipeline (mock brain)

## What we did

Surfaced that "Content Digest" conflicts with the bootstrap "no backend" constraint (cross-origin fetch + a server-side API key) and used `AskUserQuestion` per the escalation rules. The user chose a thin backend proxy (ADR 002) with AI mocked first. Built the pure digest pipeline: a `Digest`/`Digester` contract, text helpers (`splitSentences`, `tokenize`, `contentWords`), and a deterministic `mockDigest` producing summary / key points / tags / suggested category, all spec-first (red → green).

## What worked

- The escalation rule fired exactly as designed — the constraint conflict was caught before any code, and resolved with one ADR.
- Defining a `Digester` interface up front gives a clean seam: the mock today and the HTTP/Claude impl (Feature 004) are swappable without touching callers.
- Determinism made specs trivial and stable (no clock, no randomness) — `toEqual` on repeated calls is a real regression guard.

## What didn't / friction points

- `noUncheckedIndexedAccess` required guarding every array index (`[0] ?? ''`, `pop() ?? ''`). Minor but constant; worth a note so the next module budgets for it.
- Category detection is exact-token matching, so plural/inflected keywords miss (`algorithms` ≠ `algorithm`). Acceptable for a deterministic mock; the real model handles this in Feature 004.

## Decisions to carry forward

- [ADR 002 — thin backend proxy](../decisions/002-content-digest-architecture.md). Real model choice (Haiku 4.5 vs Sonnet 4.6) deferred to Feature 004.

## Changes made to CLAUDE.md / constraints / working agreement

- Amended the "no backend" line in `docs/constraints.md` to reference ADR 002.
- Added ADR 002 to the CLAUDE.md documentation map.

## Open questions for next session

- None for the mock.
