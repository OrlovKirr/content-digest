# Overview

## Goal

A learning playground — a sandbox to practice agentic engineering (spec-first development, ADRs, retrospectives) using Vite + React + TypeScript.

## Primary user / context

Course students following the AI Engineering Course. They run the app locally in a browser on their own machines via `npm run dev`.

## Success criteria

- The app builds and the dev server serves an `<h1>` greeting that includes the project name.
- The pure `greeting(name)` module is covered by a passing spec.
- Every new feature follows the spec-first loop and ends with a retrospective.
- Governance (docs, CLAUDE.md) stays at the repo root; all app code stays under `app/`.

## Out of scope

- No backend, API, server, or database — frontend only.
- No authentication or user accounts.
- No client-side routing (single page).
- No CSS framework, theming, or design system beyond minimal inline styles.
