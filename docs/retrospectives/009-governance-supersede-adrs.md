# Retro 009 — Governance: supersede ADR 002/003 + "no DB" (issue #11)

## What this was

[Issue #11](https://github.com/OrlovKirr/content-digest/issues/11) asked to record the
stack pivot in governance: supersede ADR 002 (thin proxy) and ADR 003 (Hono + Anthropic
deps), lift the "no database" constraint, and keep the docs map consistent — so no doc
silently contradicts another.

## What worked

- **The substance was already done.** [ADR 004](../decisions/004-new-stack-fastapi-vercel.md)
  was written as issue #11's deliverable ("landed first… so the rest of the migration
  proceeds on a legitimate governance footing") back when the `web/` shell shipped. It
  already supersedes 002/003, amends `constraints.md`, and the CLAUDE.md docs map already
  labels 002/003 "(superseded by 004)". Reading the existing decision trail before writing
  anything new avoided a redundant ADR.
- **Checking the acceptance criterion literally found the one real gap.** "No doc silently
  contradicts another" — ADR 004 pointed *back* to 002/003, but 002/003 had no forward
  pointer. A reader landing directly on ADR 002 still read "no database / `localStorage`" as
  if authoritative. The fix was two `> **Status: Superseded by ADR 004**` banners.

## What didn't

- **An issue's checkbox list can imply more work than its acceptance criterion needs.**
  Issue #11 listed three separate "ADR: …" tasks, which reads like "write three ADRs." The
  acceptance criterion only required a coherent, non-contradictory decision trail — one
  consolidated ADR 004 plus forward banners satisfies it. Splitting into three ADRs would
  have been churn for no governance gain. **Lesson: treat the Acceptance section as the
  contract; treat the task checklist as one possible decomposition, not a mandate.**
- **Superseded ADRs are easy to leave dangling.** When an ADR supersedes others, the
  forward-pointing banner on the *old* docs is the part that's easy to forget, because the
  author is focused on the new ADR. **Lesson: superseding an ADR is a two-sided edit —
  new ADR points back, each old ADR points forward — and isn't done until both sides link.**

## Workflow change applied this session

Added a one-line rule to `CLAUDE.md` (working agreement): when an ADR supersedes another,
add a `Status: Superseded by …` banner to the top of each superseded ADR in the same change.
No new ADR (the change is a documentation convention, not architecture).
