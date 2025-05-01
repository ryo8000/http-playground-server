# Simple Mock Server

A simple mock server built with Node.js and Express.

## API

| HTTP request             | Description                                             | Notes |
| ------------------------ | ------------------------------------------------------- | ----- |
| **POST** /mirror/        | Returns the request body as a response.                 |       |
| **POST** /shutdown/      | Triggers a shutdown of the server.                      |       |
| **GET** /status/{status} | Returns a response with the specified http status code. |       |

### Common Query parameters

| Parameter | Type   | Description                                                 |
| --------- | ------ | ----------------------------------------------------------- |
| delay     | Number | Delays the response by the specified value in milliseconds. |

### Other Features

- The server implements graceful shutdown handling:
  - Responds to SIGTERM signals for clean shutdown.
  - Provides a 10-second timeout for graceful shutdown.
  - Logs shutdown progress and any errors.

## Build and Run the Application

### Using Docker

1. Clone this repository:

   ```bash
   git clone https://github.com/ryo8000/simple-mock-server.git
   cd simple-mock-server
   ```

2. Build and run the application in a Docker container:

   ```bash
   docker build -t simple-mock-server .
   docker run -p 8000:8000 simple-mock-server
   ```

### Using Yarn

1. Clone this repository:

   ```bash
   git clone https://github.com/ryo8000/simple-mock-server.git
   cd simple-mock-server
   ```

2. Install dependencies using Yarn:

   ```bash
   yarn install
   ```

3. Build the application:

   ```bash
   yarn build
   ```

4. Run the application:

   ```bash
   node dist/server.js
   ```

## Environment Variables

| Name            | Description                                                  | Required | Default Value |
| --------------- | ------------------------------------------------------------ | -------- | ------------- |
| ENABLE_SHUTDOWN | Enables the /shutdown endpoint                               | No       | false         |
| ORIGIN          | The value of the Access-Control-Allow-Origin response header | No       | \*            |
| PORT            | Port number for this application                             | No       | 8000          |

## Development

For developer-specific instructions, including details on testing and project structure, see the [Development Guide](./docs/DEVELOPMENT_GUIDE.md).

## License

This project is licensed under the [MIT License](./LICENSE).
