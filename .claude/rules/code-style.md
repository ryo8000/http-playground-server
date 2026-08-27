---
paths:
  - "src/**/*.ts"
---

# Code Style Rules (src/)

## Layering

Endpoint logic lives in `src/services/` as pure functions taking plain values (never `req`/`res`); shared helpers go in `src/utils/` — check there before writing new helper logic. What lives in the service vs the route depends on one question: **does the success response have an irreducible `res`/socket side effect** (streaming, `socket.destroy()`, never responding)?

- **No** — the service returns the whole response as `{ status, body }`, plus a `headers` record if it sets custom headers (`src/services/big-headers.ts`); add an `ok` discriminant only when the route branches on it (`src/services/status.ts`), else a plain union (`src/services/base64.ts`). The route just forwards it, applying headers via `Object.entries(result.headers)` rather than by name (`src/routes/basic-auth.ts`).
- **Yes** (drip, truncate, disconnect, reset, keep-alive-cut) — the service only validates and returns resolved params, with `status`/`body` on the error case; the route owns all `res`/socket orchestration, including `res.on('close')` cleanup (`src/routes/drip.ts`). With no params to validate, skip the service entirely (`src/routes/reset.ts`).

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

- Every named function gets a JSDoc (purpose, `@param`, `@returns`) — including non-exported helpers like the `badRequest` factories in `src/services/`.
- Add inline comments only for a non-obvious constraint or decision, not boilerplate that restates the code.

## Scope discipline

- Prefer editing existing files over creating new ones.
- Follow YAGNI/DRY: implement only what is requested or clearly necessary (no speculative error handling or hypothetical extensibility), and commonize only once duplication is real and identical.
- Inline single-use values; don't extract constants, type aliases, or an `ok` flag that nothing branches on.
