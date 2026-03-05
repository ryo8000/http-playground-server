---
paths:
  - "src/**/*.ts"
---

# Code Style Rules

## File Management
- **NEVER create files** unless absolutely necessary to achieve the goal.
- **ALWAYS prefer editing** an existing file over creating a new one.

## DRY (Don't Repeat Yourself)
- Extract shared logic into reusable utilities rather than duplicating code across files.
- Before implementing new logic, check if a utility already exists in `src/`.

## JSDoc Comments
Write JSDoc comments for:
- All **public functions**
- All **classes**
- Any **complex logic** that isn't self-evident

Each JSDoc should explain: purpose, parameters (`@param`), and return value (`@returns`).

```ts
/**
 * Parses the delay query parameter and clamps it to the configured maximum.
 *
 * @param value - Raw query string value for the delay parameter.
 * @param maxDelay - Maximum allowed delay in milliseconds.
 * @returns Clamped delay in milliseconds, or 0 if the value is invalid.
 */
```

## Avoid Over-Engineering
- Only add what is directly requested or clearly necessary.
- Don't add error handling for scenarios that can't happen.
- Don't design for hypothetical future requirements.
