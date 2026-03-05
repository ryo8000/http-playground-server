---
paths:
  - "src/**/*.ts"
  - "tests/**/*.ts"
---

# Testing Rules

## Structure
- Unit tests live in `tests/ut/` and **mirror the `src/` directory structure**.
  - e.g., `src/routes/echo.ts` → `tests/ut/routes/echo.test.ts`
- API integration tests use Newman with Postman collections in `tests/api/`.

## Tooling
- Use **Supertest** for HTTP endpoint testing in unit tests.
- Use **Jest** as the test runner (`yarn test` generates a coverage report).
- Run API tests with `yarn test:api` (requires the server to be running, e.g., with `yarn dev`).

## Requirements
- New public functions must have corresponding unit tests.

## Coverage
- Tests should cover normal cases, edge cases, and error scenarios for each endpoint or function.
