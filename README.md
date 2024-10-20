# Simple Mock Server

A simple mock server built with Node.js and Express.

## API

| HTTP request             | Description                                             | Notes |
| ------------------------ | ------------------------------------------------------- | ----- |
| **GET** /status/{status} | Returns a response with the specified http status code. |       |

## Getting Started

### Prerequisites

- Node.js (version 18.x or higher recommended)
- Yarn (for package management)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ryo8000/simple-mock-server.git
   ```

2. Navigate to the project directory:

   ```bash
   cd simple-mock-server
   ```

3. Install dependencies using Yarn:

   ```bash
   yarn install
   ```

### Running the Application

To start the development server:

```bash
yarn dev
```

This command will start the server with Nodemon, which automatically restarts it when file changes are detected.

### Building the Project

To compile the TypeScript code:

```bash
yarn build
```

This will generate JavaScript files from the TypeScript source code.

### Running Tests

To run tests using Jest:

```bash
yarn test
```

This will execute all the test cases located in the `tests/` directory.

## Environment Variables

| Environment Variable | Description                      | Required | Default |
| -------------------- | -------------------------------- | -------- | ------- |
| PORT                 | Port number for this application | N        | 8000    |

## License

This project is licensed under the [MIT License](./LICENSE).
