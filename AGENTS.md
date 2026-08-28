# HTTP Playground Server: Operating Rules

## Project basics
- Runtime: Node.js + Express 5 + TypeScript (ESM). Provides HTTP testing endpoints (status codes, delays, errors, echo, etc.).
- Package manager: Yarn 1.
- Keep changes minimal and consistent with existing coding patterns in `src/` and `tests/ut/`.

## Completion checklist
1. `yarn verify` (runs format:check, lint, typecheck in order)
2. `yarn test`

For endpoint or middleware behavior changes, also run:
- `yarn test:e2e`

## Expectations for changes
- Prefer adding or updating tests when changing behavior.
- Avoid unrelated refactors in the same patch.
- Document new endpoints in the README API Reference table.

## PR output expectations
- Report commands run and their outcomes.
- Mention risk/impact areas explicitly (routes, middleware, env vars).
