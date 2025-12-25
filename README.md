# HTTP Playground Server

[![CI](https://github.com/ryo8000/http-playground-server/actions/workflows/ci.yml/badge.svg)](https://github.com/ryo8000/http-playground-server/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A lightweight **HTTP playground server** for instantly simulating requests and responses—no complex pre-configuration needed. Ideal for front-end, QA, or integration testing workflows.

Built with **Node.js** and **Express**.

---

## 📚 API Reference

| Method | Path                    | Description                                                                                                  |
| ------ | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ALL`  | `/base64/encode`        | Encodes a string value to Base64 format.                                                                     |
| `ALL`  | `/base64/decode`        | Decodes a Base64 string to its original format.                                                              |
| `ALL`  | `/basic-auth`           | Tests HTTP Basic Authentication by comparing credentials from Authorization header against query parameters. |
| `ALL`  | `/error/timeout`        | Simulates a timeout by never sending a response.                                                             |
| `ALL`  | `/error/network`        | Simulates a network error by closing the connection.                                                         |
| `ALL`  | `/error/malformed-json` | Returns malformed JSON response.                                                                             |
| `ALL`  | `/error/error`          | Throws an unhandled exception to trigger Express error handler.                                              |
| `ALL`  | `/mirror`               | Returns the request body as a response.                                                                      |
| `ALL`  | `/redirect`             | Returns a redirect response based on the `status` and `url` of the query parameters.                         |
| `ALL`  | `/request`              | Return a structured JSON dump of the incoming request.                                                       |
| `ALL`  | `/shutdown`             | Triggers a shutdown of the server. Requires `ENABLE_SHUTDOWN=true`.                                          |
| `ALL`  | `/status/{status}`      | Respond with a given HTTP status code (must be between 200 and 599).                                         |
| `ALL`  | `/uuid`                 | Generate and return a random UUID (version 4).                                                               |

### Query Parameters

| Name       | Type   | Default | Description                                                 |
| ---------- | ------ | ------- | ----------------------------------------------------------- |
| `delay`    | Number | `0`     | Delays the response by the specified value in milliseconds. |
| `status`   | Number | —       | HTTP status code for `/redirect` or `/status/{status}`.     |
| `url`      | String | —       | Target URL for `/redirect`.                                 |
| `user`     | String | —       | Expected username for `/basic-auth` (required).             |
| `password` | String | —       | Expected password for `/basic-auth` (required).             |

---

## ⚙️ Environment Variables

| Name                 | Required | Default       | Description                                                          | Notes                          |
| -------------------- | -------- | ------------- | -------------------------------------------------------------------- | ------------------------------ |
| `NODE_ENV`           | No       | `development` | Sets the environment mode. (`development`, `production`, `test`)     |                                |
| `LOG_LEVEL`          | No       | `info`        | Sets the logging level. (`debug`, `info`, `warn`, `error`)           |                                |
| `PORT`               | No       | `8000`        | Port number for this application.                                    |                                |
| `KEEP_ALIVE_TIMEOUT` | No       | `5000`        | HTTP keep-alive timeout in milliseconds.                             |                                |
| `HEADERS_TIMEOUT`    | No       | `10000`       | HTTP headers timeout in milliseconds.                                | Must be > `KEEP_ALIVE_TIMEOUT` |
| `REQUEST_TIMEOUT`    | No       | `30000`       | Request timeout in milliseconds.                                     | Must be > `HEADERS_TIMEOUT`    |
| `ENABLE_SHUTDOWN`    | No       | `false`       | Enables the /shutdown endpoint.                                      |                                |
| `MAX_DELAY`          | No       | `10000`       | Maximum delay allowed for the delay query parameter in milliseconds. |                                |
| `ORIGIN`             | No       | `*`           | The value of the Access-Control-Allow-Origin response header.        |                                |

---

## 🚀 Build and Run the Application

### Using Docker

1. Clone this repository:

   ```bash
   git clone https://github.com/ryo8000/http-playground-server.git
   cd http-playground-server
   ```

2. Build and run the application in a Docker container:

   ```bash
   docker build -t http-playground-server .
   docker run -p 8000:8000 http-playground-server
   ```

### Using Yarn

1. Clone this repository:

   ```bash
   git clone https://github.com/ryo8000/http-playground-server.git
   cd http-playground-server
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

---

## 🧑‍💻 Development

For developer-specific instructions, including details on testing and project structure, see the [Development Guide](./docs/DEVELOPMENT_GUIDE.md).

---

## 📜 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
