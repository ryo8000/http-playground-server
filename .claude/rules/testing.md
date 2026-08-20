---
paths:
  - "src/**/*.ts"
  - "tests/**"
---

# Testing Rules

## Structure

- Unit tests in `tests/ut/` mirror `src/` exactly (`src/services/base64.ts` → `tests/ut/services/base64.test.ts`). Route tests use Supertest; service tests call functions directly.
- E2E: Postman collection `tests/e2e/e2e-test-collection.json`, run via Newman against `{{baseUrl}}` = `http://localhost:8000`.

## Requirements

- Any `src/` behavior change updates the mirrored unit test in the same patch; new exported functions need new tests. Endpoint changes also update the e2e collection.
- Cover normal, edge, and error cases (status code and error body shape).

## Style

- Group parallel cases with `it.each`, not repeated near-identical `it` blocks. Keep `describe` nesting minimal (one per function/endpoint); no `describe` wrapping a single test or restating test names.
- Assert status and the full body with `toEqual` (or a `{ status, body }` object), not field-by-field `toBe`. Match dynamic values (UUIDs, timestamps) with `expect.any(...)` or `toMatch`.
- Only test inputs the type signature and Express allow (query params are `string | string[] | undefined` — no invented numeric/boolean cases). Order success cases before error cases.
- Keep tests deterministic; restore mutated env vars, timers, mocks, and spies.

## Running

- `yarn test` — all unit tests; `npx jest <path>` for one file. `yarn test:e2e` needs the server running (`yarn build && node dist/server.js`, port 8000; the `/verify` skill automates this).
- Jest runs ts-jest in ESM mode; test files import from `src/` with `.js` extensions.
