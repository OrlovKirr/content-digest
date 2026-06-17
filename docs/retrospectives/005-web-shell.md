# Retrospective 005 — Web shell (PLAN step 1 / issue #6)

## What shipped

- [ADR 004](../decisions/004-new-stack-fastapi-vercel.md): adopt the FastAPI / Vercel / Postgres / OpenRouter stack, superseding ADR 002/003 and amending the "no database" + "no app code outside `app/`" constraints. Landed **first** (issue #11's substance) so the migration proceeds on a legitimate governance footing.
- [feature-005-web-shell.md](../requirements/feature-005-web-shell.md): spec for the shell.
- New `web/` package: Vite + React + TS (strict), paste form with validation, topic board, card component, placeholder data. No API and no client storage yet. 14 specs green; `tsc -b && vite build` and `eslint .` clean. Verified in-browser on port 5174.

## What worked

- **Porting the proven `app/` modules** (`group`, `title`, components, taxonomy) instead of writing fresh placeholders. The logic already had passing specs and matched the required category taxonomy and validation, so the shell came together quickly and stayed consistent with the existing product.
- **Mirroring `app/`'s toolchain** (tsconfig trio, ESLint 10 flat config, no `baseUrl`, `strictPort`) avoided re-discovering the TS 6 / ESLint 10 pitfalls already recorded in constraints.md.
- **ADR-first ordering** (the user's call) meant creating `web/` did not violate the then-current "no app code outside `app/`" constraint.

## What didn't

- **Two `.claude/launch.json` files.** The preview tool reads the launch.json in the *session* working directory (the parent of the repo root), not the repo-root one. First `preview_start` silently ran the legacy root config on 5173. Resolved by adding a `Web dev server` (5174) config to the parent launch.json. Worth knowing the repo root is nested one level below the session cwd.
- **Screenshot tool returned a collapsed sliver** regardless of viewport preset. The accessibility snapshot + `eval` assertions were the reliable proof; for this repo, snapshot-based verification is the default and screenshots are unreliable.

## Workflow changes

- Record the **port allocation** for the migration in CLAUDE.md: legacy `app/` 5173 / `server/` 8787; new `web/` 5174 (preview 4174). `web/` takes 5173/4173 when `app/` is removed at the deploy step.
- During the migration the tree carries **two frontends and two backends**; CLAUDE.md "Current state" names which is canonical so future sessions are not confused.
- No CLAUDE.md *rule* changes were required — the existing strict-TS / pure-module / spec-first rules carry over to `web/` unchanged.
