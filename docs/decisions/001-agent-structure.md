# ADR 001 — Root-vs-`app/` split and docs subfolders

## Context

This project follows agentic engineering practices: spec-first development, recorded decisions, and a workflow that improves itself via retrospectives. For that to work, the governance layer an agent reads (entry point, requirements, decisions, constraints, retros) must be unambiguously separated from the application code it edits. Mixing `CLAUDE.md` and `docs/` into the Vite app folder makes the boundary fuzzy and invites app tooling (build, lint, bundler) to pick up governance files.

## Decision

- The **repo root** holds git, the governance layer, root pass-through `package.json`, and shared dotfiles (`.gitignore`, `.editorconfig`, `.nvmrc`, `.env.example`).
- **All application code** lives under `app/` — a standard Vite + React + TS project. Root scripts delegate to it via `npm --prefix app run <script>`.
- `docs/` is structured into subfolders:
  - `requirements/` — `overview.md` plus one `feature-NNN-*.md` per feature.
  - `decisions/` — numbered ADRs (this file is 001).
  - `retrospectives/` — one `NNN-<slug>.md` per shipped feature; drives workflow changes.
  - `constraints.md` — the running "what NOT to do" list.
- A single root-level `.gitignore` is used; Vite's generated `app/.gitignore` is removed.

## Consequences

- The agent always reads governance from the root and edits code under `app/` — no ambiguity.
- App tooling never accidentally lints or bundles governance docs.
- Root scripts mean contributors run everything from the repo root (`npm run dev`, `test`, `lint`, ...).
- A second package later (e.g. `packages/shared/`) would justify switching from `--prefix` pass-through to npm workspaces; recorded as deferred.
