# HTTP Playground Server: Operating Rules

## Project basics
- Runtime: Node.js + Express + TypeScript (ESM).
- Package manager: Yarn.
- Keep changes minimal and consistent with existing coding patterns in `src/` and `tests/ut/`.

## Completion checklist
1. `yarn verify` (runs format:check, lint, typecheck in order)
2. `yarn test`

For endpoint behavior changes, also run:
- `yarn test:e2e`

## Expectations for changes
- Prefer adding or updating tests when changing behavior.
- Keep route handlers focused and maintainable.
- Avoid unrelated refactors in the same patch.

## PR output expectations
- Summarize what changed and why.
- Report commands run and their outcomes.
- Mention risk/impact areas explicitly (routes, middleware, env vars).
