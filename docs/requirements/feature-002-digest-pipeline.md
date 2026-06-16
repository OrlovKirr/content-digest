# Feature 002 — Digest pipeline (mock brain)

## User story

As a user pasting article content, I want the app to turn raw text into a structured **digest** — a short summary, a few key points, topic tags, and a suggested category — so each article becomes a tidy card I can scan and file by topic.

This feature implements the **pure logic** behind that digest with a deterministic mock (no network, no AI key). Real Claude is wired later (Feature 004) behind the same `Digester` interface.

## Contract

```ts
type Category = 'Technology' | 'Business' | 'Science' | 'Health' | 'Culture' | 'Other';

interface Digest {
  summary: string;        // 1–3 sentences
  keyPoints: string[];    // up to 5 bullet-sized strings
  tags: string[];         // up to 5 lowercase keyword tags
  suggestedCategory: Category;
}

interface Digester {
  digest(input: { text: string; title?: string }): Promise<Digest>;
}
```

## Acceptance criteria

- GIVEN article text WHEN passed to the mock digester THEN it returns a `Digest` with a non-empty `summary`, between 1 and 5 `keyPoints`, between 1 and 5 lowercase `tags`, and a `suggestedCategory` from the fixed taxonomy.
- GIVEN the **same** input THEN the mock returns the **same** digest every time (deterministic — no randomness, no clock).
- GIVEN empty or whitespace-only text THEN the digester throws (callers must pass real content).
- GIVEN text dominated by a category's vocabulary (e.g. "startup, revenue, funding, market") THEN `suggestedCategory` reflects it (here: `Business`); ambiguous/empty-signal text falls back to `Other`.
- GIVEN text with common stop-words ("the", "and", "of") THEN those never appear as `tags`.

## Out of scope

- Real AI / network calls (Feature 004).
- URL fetching / article extraction (Feature 004, server-side).
- Board, cards, persistence, UI (Feature 003).

## Open questions

- None for the mock. The real-model summary quality is a Feature 004 concern.
