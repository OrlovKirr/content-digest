# Constraints — what NOT to do

## From project scope (Step 1)

- ~~No backend, API, server, or database — this is a frontend-only learning playground.~~
  **Amended by [ADR 002](decisions/002-content-digest-architecture.md):** a single **thin backend proxy** is permitted **solely** for article-text extraction and Claude API calls (so the API key never reaches the browser). No general-purpose backend, no database — board state persists in `localStorage`. The frontend remains the primary app and talks only to `POST /api/digest`.
- No authentication or user accounts.
- No client-side routing (single page).
- No CSS framework, theming, or design system beyond minimal inline styles.

## Baseline engineering guardrails

- No unscoped refactors. Change only what the current spec/feature requires.
- No new runtime dependencies without an ADR under `docs/decisions/`.
- No code without a spec — every module starts with a failing `*.spec.ts(x)`.
- No skipping the retrospective after a feature.
- **No governance files inside `app/`** (`CLAUDE.md`, `README.md`, `docs/**` stay at the repo root).
- **No app code outside `app/`** (only root-level config/dotfiles belong at the root).
- **No `eslint-plugin-react`** until it supports ESLint 10. The current Vite template ships ESLint 10; `eslint-plugin-react-hooks` covers the important rules.
- Do not loosen TypeScript strictness (`strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`). Narrow the type or guard the value instead.

## Tooling notes

- The `lint` script uses `eslint .` (flat config restricts to `*.ts`/`*.tsx` via `files`). ESLint 10 removed the `--ext` flag, so it is intentionally omitted.
- Do not add `baseUrl` to any `tsconfig*.json`. TypeScript 6 (shipped by the current Vite template) deprecates it and `tsc -b` errors out. The `@/*` path alias resolves relative to the tsconfig without `baseUrl`.
