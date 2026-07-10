---
name: new-endpoint
description: Scaffold a new HTTP endpoint for this server — service, route, app registration, mirrored unit tests, e2e collection entry, and README documentation. Use when adding a new endpoint or endpoint group.
---

# New Endpoint

Follow the existing `/base64` implementation as the reference pattern (`src/routes/base64.ts`, `src/services/base64.ts`, and their mirrored tests). Code and test conventions are covered by the rules in `.claude/rules/` (`code-style.md`, `testing.md`), which load automatically when editing `src/` and `tests/`. Complete every step — a new endpoint is not done until tests, e2e, and docs are updated.

## Checklist

1. **Service** — `src/services/<name>.ts`: pure functions taking plain values (never `req`/`res`) and returning a typed `{ status, body }` result. Skip this file only if the route has no logic at all (like `/uuid`).
2. **Route** — `src/routes/<name>.ts`: create `Router()`, register thin handlers with `.all(...)` (this server intentionally accepts all methods unless specified otherwise), export as named `<name>Router`.
3. **Register** — in `src/app.ts`: add the import and `app.use('/<name>', <name>Router)`, keeping both lists alphabetical.
4. **Unit tests** — mirror the source: `tests/ut/routes/<name>.test.ts` and `tests/ut/services/<name>.test.ts`.
5. **E2E** — add requests with assertions to `tests/e2e/e2e-test-collection.json` (Postman format, base URL is `{{baseUrl}}`).
6. **Docs** — add a row per path to the README `API Reference` table (e.g. `/base64` has one row each for `/encode` and `/decode`). If the endpoint takes query parameters, add them to the README `Query Parameters` table. If a new env var is needed: default it in `src/env.ts`, expose via `environment`, and document it in the README `Environment Variables` table.
7. **Verify** — run the `/verify` skill, including the e2e step (endpoint behavior changed by definition).
