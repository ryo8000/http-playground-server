---
name: verify
description: Run this repo's full completion checklist — format check, lint, typecheck, unit tests, and (when endpoint behavior changed) the Newman e2e suite including server startup/shutdown. Use before declaring any code change complete, or when the user asks to verify, check, or validate the build.
---

# Verify

Run the checks below in order. Fix failures and rerun the failed step before moving on. Report every command and its actual outcome at the end — never report a skipped step as passed.

## 1. Static checks

```
yarn verify
```

- `format:check` failure → run `yarn format`.
- `lint` failure → run `yarn lint:fix`, then fix the rest by hand.

## 2. Unit tests

```
yarn test
```

## 3. E2E tests — only when endpoint/middleware behavior or `tests/e2e/` changed

The Newman suite needs the server listening on port 8000:

1. `yarn build`
2. Start the server in the background (use the Bash tool's `run_in_background`): `node dist/server.js`
3. Wait until it responds: `curl --retry 5 --retry-connrefused --retry-delay 1 -s -o /dev/null http://localhost:8000/`
4. `yarn test:e2e`
5. Stop the background server (kill the background task) — do not leave it running.

If port 8000 is already in use, ask before killing the existing process; it may be the user's `yarn dev` session (reusing it for e2e is fine).
