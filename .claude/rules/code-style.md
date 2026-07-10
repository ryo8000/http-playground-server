---
paths:
  - "src/**/*.ts"
---

# Code Style Rules (src/)

## Layering

- Route handlers must stay thin: extract request input, call a service function, respond with `res.status(result.status).json(result.body)`. When there is no body, use `res.sendStatus(result.status)` (see `src/routes/status.ts`). For non-JSON responses like redirects, send the status-appropriate reply instead (e.g. `res.redirect(result.status, result.url)`; see `src/routes/redirect.ts`).
- Endpoint logic lives in `src/services/` as pure functions that take plain values (never `req`/`res`) and return a `{ status, body }` result object. Add a discriminant like `ok` only when the route must branch on it (see `src/services/status.ts`); otherwise use a plain union without a tag (see `src/services/base64.ts`).
- Shared helpers go in `src/utils/`. Check there before writing new helper logic.

## Module conventions (ESM)

- Relative imports must end in `.js` (e.g., `import { log } from '../logger.js';`) — the project is ESM and TypeScript does not rewrite extensions.
- Use named exports only; no default exports. Routers are exported as `<name>Router`.
- Declare functions as arrow functions (`export const fn = (...) => {...}`), matching `src/services/`.
- Use explicit, descriptive names; rely on inferred types where TypeScript already makes the type clear.

## Hard rules

- Never read `process.env` outside `src/env.ts`; import `environment` instead. New env vars get a default, are added to `environment`, and documented in the README env table.
- Use `HttpStatusCodes` from `src/utils/http.ts` instead of numeric status literals.
- Log via `log` from `src/logger.ts` (pino); never `console.log`. Error logs use the `log.error({ err }, 'message')` shape.

## Comments

- Add comments (including JSDoc) only when they explain a non-obvious constraint or decision; do not add boilerplate JSDoc that restates the signature.
- Leave existing boilerplate JSDoc alone — don't strip it in unrelated patches.

## Scope discipline

- Prefer editing existing files over creating new ones.
- Follow YAGNI/DRY: implement only what is requested or clearly necessary (no speculative error handling or hypothetical extensibility), and commonize only once duplication is real and identical.
- Inline values used only once instead of extracting constants; don't add type aliases or result fields (e.g. an `ok` flag) that nothing discriminates on.
