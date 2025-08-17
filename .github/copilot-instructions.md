# Copilot Instructions for http-playground-server

## Commands

**Development**:
- `yarn dev` - Start development server with hot reload using nodemon
- `yarn build` - Compile TypeScript to JavaScript in `dist/`
- `node dist/server.js` - Run the compiled application

**Testing**:
- `yarn test` - Run unit tests with Jest and generate coverage report
- `yarn test:api` - Run API integration tests with Newman (requires server running)

**Code Quality**:
- `yarn lint` - Check code with ESLint
- `yarn lint:fix` - Fix auto-fixable ESLint issues
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting

## Architecture

This is a lightweight HTTP playground server built with Express.js and TypeScript using ES modules.
Simulate HTTP requests/responses for front-end, QA, and integration testing. No pre-configuration required.

### Key Components

**Core Structure**:
- `src/app.ts` - Main Express application setup with middleware chain and route registration
- `src/server.ts` - HTTP server startup with graceful shutdown handling
- `src/env.ts` - Environment variable validation and configuration
- `src/logger.ts` - Pino logger setup with development/production configurations

**Route Structure**:
- All routes in `src/routes/` export an Express Router
- Registered in `src/app.ts` with path prefixes

**Middleware Chain (applied in order)**:
1. `express.text()` - Text body parsing
2. `express.json()` - JSON body parsing
3. `cors()` - CORS handling with configurable origin
4. `cookieParser()` - Cookie parsing
5. `loggerMiddleware` - Request/response logging with Pino
6. `delayMiddleware` - Optional delay simulation via `?delay=ms` query parameter

**Error Handling**:
- Custom 404 handler returns standardized JSON response
- Global error handler with development/production error detail levels
- Special endpoints for simulating timeouts, network errors, malformed JSON, and unhandled exceptions

**Environment Configuration**:
- Key environment variables (defined in `src/env.ts`):
  - `ENABLE_SHUTDOWN`: Enables /shutdown endpoint
  - `LOG_LEVEL`: Logging verbosity (debug, info, warn, error)
  - `MAX_DELAY`: Maximum delay allowed for delay parameter (default 10000ms)
  - `NODE_ENV`: Environment mode affecting error handling and logging
  - `ORIGIN`: CORS origin header value (default: *)
  - `PORT`: Server port (default 8000)
  - `KEEP_ALIVE_TIMEOUT`, `HEADERS_TIMEOUT`, `REQUEST_TIMEOUT`: HTTP timeout configurations

### Testing Strategy
- Supertest for HTTP endpoint testing
- Unit tests in `tests/ut/` mirror the `src/` structure
- API tests use Newman with Postman collections in `tests/api/`

### CI/CD Pipeline
- **GitHub Actions**: Two workflows configured in `.github/workflows/`
  - `ci.yml`: Runs tests on PRs to main branch (lint, unit tests, build, API tests with Newman)
  - `docker-publish.yml`: Builds and pushes Docker images to GitHub Container Registry (GHCR) on main branch pushes

## Important Notes
- Do what has been asked; nothing more, nothing less.
- NEVER create files unless they're absolutely necessary for achieving your goal.
- ALWAYS prefer editing an existing file to creating a new one.
