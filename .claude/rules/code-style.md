---
paths:
  - "src/**/*.ts"
---

# Code Style Rules (src/)

## Layering

Endpoint logic lives in `src/services/` as pure functions taking plain values (never `req`/`res`); shared helpers go in `src/utils/`. What lives in the service vs the route depends on one question: **does the success response have an irreducible `res`/socket side effect** (streaming, `socket.destroy()`, never responding)?

- **No** (base64, status, redirect, big-headers): the service returns the whole response as `{ status, body }` — plus a `headers` record if it sets custom headers (`src/services/big-headers.ts`). Add an `ok` discriminant only when the route branches on it (`src/services/status.ts`); else a plain union (`src/services/base64.ts`). The route forwards `res.status(result.status).json(result.body)` — or `res.sendStatus` with no body (`src/routes/status.ts`), or `res.redirect(result.status, result.url)` (`src/routes/redirect.ts`) — and applies headers generically via `Object.entries(result.headers)` (`src/routes/basic-auth.ts`), never hardcoding names.
- **Yes** (drip, truncate, disconnect, reset, keep-alive-cut): the service only validates and returns resolved params (error case still carries `status`/`body`); the route owns all `res`/socket orchestration — headers, `flushHeaders`, `setInterval`/`write`/`end`, `socket.destroy`, `res.on('close')` cleanup. Don't push the success path into the service (`src/routes/drip.ts`).

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

- Prefer editing existing files over creating new ones; no unrelated refactors in the same patch.
- Inline single-use values; don't extract constants, type aliases, or an `ok` flag that nothing branches on.
