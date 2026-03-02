# Code Modification Workflow

When asked to modify or add code, follow these steps in order:

1. **Understand the Goal** — Fully understand the requested change before touching any files.
2. **Implement Code Changes** — Modify application code to meet the requirements.
3. **Update Related Tests** — If any logic changed, update the corresponding test code in `tests/ut/` to correctly cover the new behavior.
4. **Verify Your Work** — Run the following commands and ensure they all pass:
   - `yarn format` — Apply Prettier formatting
   - `yarn lint:fix` — Fix ESLint issues
   - `yarn test` — Run all unit tests with coverage
   - `yarn test:api` — Run API tests when API behavior or collections changed (requires server running)
5. **Finalize** — Confirm all steps are complete and all checks passed before finishing.

> Never skip the verification step, even for small changes.
