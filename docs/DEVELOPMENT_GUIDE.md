# Development Guide for Simple Mock Server

This guide covers development-specific details for contributing to the Simple Mock Server.

## Project Structure

```
├── src
│   ├── app.ts               # Main application setup
│   ├── constants.ts         # Application constants
│   ├── env.ts               # Environment variable handler
│   ├── middlewares          # middlewares directory
│   ├── models               # models directory
│   ├── routes               # API routes directory
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

## Building the Application

To compile the TypeScript code:

```bash
yarn build
```

This will generate JavaScript files from the TypeScript source code.
