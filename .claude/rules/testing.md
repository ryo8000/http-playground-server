---
paths:
  - "src/**/*.ts"
  - "tests/**"
---

# Testing Rules

## Structure

- Unit tests live in `tests/ut/` and mirror `src/` exactly: `src/routes/mirror.ts` → `tests/ut/routes/mirror.test.ts`, `src/services/base64.ts` → `tests/ut/services/base64.test.ts`.
- Route tests use Supertest against the exported `app` from `src/app.ts`; service tests call the functions directly.
- E2E tests are a Postman collection (`tests/e2e/e2e-test-collection.json`) run via Newman against `{{baseUrl}}` = `http://localhost:8000`.

## Requirements

- Any behavior change in `src/` requires updating the mirrored unit test in the same patch. New exported functions need new tests.
- Cover normal cases, edge cases, and error responses (status code and error body shape).
- Endpoint behavior changes must also be reflected in the e2e collection.

## Style

- Group parallel cases with `it.each` instead of repeating near-identical `it` blocks.
- Keep `describe` nesting minimal: one `describe` per function/endpoint is usually enough. Don't add a `describe` that contains a single test or merely restates the test names.
- Assert the response status and the full body using `toEqual` (or construct a `{ status, body }` object to assert against), rather than field-by-field `toBe` checks.
- Only test inputs that can actually occur given the function's type signature and Express's behavior (e.g. query params arrive as `string | string[] | undefined` — don't invent numeric/boolean cases the caller can't produce).
- Order tests: success cases first, then error cases.
- Keep tests deterministic and restore mutated environment variables, timers, mocks, and spies.

## Running

- `yarn test` — all unit tests; `npx jest tests/ut/path/to/file.test.ts` for a single file.
- `yarn test:e2e` — requires the server running first (`yarn build && node dist/server.js`, port 8000). The `/verify` skill automates this.
- Jest runs ts-jest in ESM mode; test files import from `src/` with `.js` extensions like production code does.
