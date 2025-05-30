# Development Guide for Simple Mock Server

This guide covers development-specific details for contributing to the Simple Mock Server.

## Project Structure

```
├── src
│   ├── app.ts               # Main application setup
│   ├── env.ts               # Environment variable handler
│   ├── logger.ts            # Application logging configuration
│   ├── middlewares          # Middlewares directory
│   ├── routes               # API routes directory
│   ├── server.ts            # Server startup and shutdown handling
│   └── utils                # Utility functions directory
├── tests                    # Jest tests directory
└── Dockerfile               # Docker configuration
```

## Setup

To install dependencies using Yarn:

```bash
yarn install
```

## Running the Application

To start the development server:

```bash
yarn dev
```

This command will start the server with Nodemon, which automatically restarts it when file changes are detected.

## Running Tests

To run tests using Jest:

```bash
yarn test
```

This will execute all the test cases located in the `tests/` directory.

## Linting

To check for linting issues using ESLint:

```bash
yarn lint
```

To automatically fix linting issues:

```bash
yarn lint:fix
```

These commands help maintain code quality and consistency across the `src/` and `tests/` directories.

## Formatting

To check if the code is properly formatted with Prettier:

```bash
yarn format:check
```

To automatically format the code:

```bash
yarn format
```

These commands ensure consistent code style in the `src/` and `tests/` directories.

## Building the Application

To compile the TypeScript code:

```bash
yarn build
```

This will generate JavaScript files from the TypeScript source code.
