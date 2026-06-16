# Retrospective 001 — Hello World Bootstrap

## What we did

Scaffolded a Vite + React + TypeScript app into `app/`, wired root pass-through scripts and shared dotfiles at the repo root, added the agentic governance layer (`CLAUDE.md`, `README.md`, `docs/` with requirements, an ADR, constraints, and a retrospectives folder). Built hello world as Feature 001 through the full spec-first loop: requirements doc → failing `greeting.spec.ts` (red) → minimal `greeting.ts` (green) → `App.tsx` rendering the greeting. Probed free ports (5173/4173 were available), set `strictPort`, started the dev server, and confirmed HTTP 200 with the React mount point before opening the browser.

## What worked

- Spec-first loop produced a clean red→green transition; the `Cannot find module './greeting'` failure was exactly the expected red.
- The root-vs-`app/` split kept governance and app code unambiguous; root `--prefix app` scripts let every command run from the repo root.
- TypeScript strict flags + the `@` path alias mirrored across `tsconfig.app.json`, `vite.config.ts`, and `vitest.config.ts` with no drift.
- Default ports were free, so no config substitution was needed.

## What didn't / friction points

- **ESLint 10 removed the `--ext` flag.** The boilerplate's suggested `eslint . --ext ts,tsx` would error, so the `lint` script stays `eslint .` (flat config already scopes to `*.ts`/`*.tsx` via `files`). Recorded in `docs/constraints.md`.
- `eslint-plugin-react` is incompatible with ESLint 10; we rely on `eslint-plugin-react-hooks`. Recorded as a constraint.
- Editing tool required reading each scaffolded file before overwriting — minor, expected discipline.

## Decisions to carry forward

- See [ADR 001 — root-vs-`app/` split](../decisions/001-agent-structure.md). No new ADR needed for this feature.

## Changes made to CLAUDE.md / constraints / working agreement

- Added the ESLint `--ext` / `eslint-plugin-react` notes to `docs/constraints.md`.
- Linked this retro from the "Self-improvement log" section of `CLAUDE.md`.

## Open questions for next session

- None.
