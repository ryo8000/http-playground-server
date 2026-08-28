---
name: new-endpoint
description: Scaffold a new HTTP endpoint for this server — service, route, app registration, mirrored unit tests, e2e collection entry, and README documentation. Use when adding a new endpoint or endpoint group.
---

# New Endpoint

Follow the existing `/base64` implementation as the reference pattern (`src/routes/base64.ts`, `src/services/base64.ts`, and their mirrored tests). Code and test conventions are covered by the rules in `.claude/rules/` (`code-style.md`, `testing.md`), which load automatically when editing `src/` and `tests/`. Complete every step — a new endpoint is not done until tests, e2e, and docs are updated.

## Checklist

1. **Service** — `src/services/<name>.ts`: pure functions taking plain values (never `req`/`res`). Apply the layering rule (`.claude/rules/code-style.md` → Layering) to decide what the service returns, what the route orchestrates, and whether the endpoint needs a service at all.
2. **Route** — `src/routes/<name>.ts`: thin handlers registered with `.all(...)` (this server intentionally accepts all methods unless specified otherwise).
3. **Register** — in `src/app.ts`: add the import and `app.use('/<name>', <name>Router)`, keeping both lists alphabetical.
4. **Unit tests** — mirror the source in `tests/ut/`.
5. **E2E** — add requests with assertions to `tests/e2e/e2e-test-collection.json` (Postman format, base URL is `{{baseUrl}}`).
6. **Docs** — add a row per path to the README `API Reference` table, using the full path (e.g. `/base64` gets a row each for `/base64/encode` and `/base64/decode`). If the endpoint takes query parameters, add them to the README `Query Parameters` table. If a new env var is needed: default it in `src/env.ts`, expose via `environment`, and document it in the README `Environment Variables` table.
7. **Verify** — run the `/verify` skill, including the e2e step (endpoint behavior changed by definition).

## Watch for

- **HEAD** — timer-driven endpoints must short-circuit after headers (`if (req.method === 'HEAD') { res.end(); return; }`; see `src/routes/drip.ts`) so the timer never runs; guard body assertions with `if (method !== 'head')`.
- **Constants** — only cross-cutting resource bounds go in `env.ts` (like `MAX_DELAY`); per-endpoint limits stay in the service. Comment only non-obvious values (`8192` = 8 KiB header limit).
- **E2E limits** — endpoints that break the connection, never respond, shut the server down, or fail client-side can't be asserted in Newman; omit them.
