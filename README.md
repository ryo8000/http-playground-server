# HTTP Playground Server

[![CI](https://github.com/ryo8000/http-playground-server/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/ryo8000/http-playground-server/actions/workflows/pr-checks.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A lightweight **HTTP playground server** for instantly simulating requests and responses—no complex pre-configuration needed. Ideal for front-end, QA, or integration testing workflows.

Built with **Node.js** and **Express**.

---

## ⚡ Try It Instantly

### In your browser, with GitHub Codespaces

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/ryo8000/http-playground-server?devcontainer_path=.devcontainer%2Fdemo%2Fdevcontainer.json)

The badge opens a Codespace with the **HTTP Playground** configuration, which starts the server on port `8000` automatically. Send requests straight from the terminal:

```bash
curl -i localhost:8000/status/418
curl -i localhost:8000/request
curl -sv localhost:8000/reset
```

> [!TIP]
> Use `localhost:8000` from the terminal rather than the forwarded `*.app.github.dev` URL. The forwarded URL goes through an HTTP proxy, which normalizes the connection-level behavior that endpoints like `/reset`, `/keep-alive-cut`, `/truncate`, and `/infinite` exist to demonstrate.

`/crash` and `/shutdown` are enabled in the Codespace, and they really do stop the server process. Nothing else is affected — the Codespace is yours alone — but the server will not come back on its own. Restart it with:

```bash
yarn serve
```

### On your machine, with the published image

```bash
docker run --rm -p 8000:8000 ghcr.io/ryo8000/http-playground-server:latest
```

To enable `/crash` and `/shutdown`, pass the flags before the image name:

```bash
docker run --rm -p 8000:8000 \
  -e ENABLE_SHUTDOWN=true \
  -e ENABLE_CRASH=true \
  ghcr.io/ryo8000/http-playground-server:latest
```

---

## 📚 API Reference

| Method | Path                    | Description                                                                                                            |
| ------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ALL`  | `/base64/encode`        | Encodes a string value to Base64 format.                                                                               |
| `ALL`  | `/base64/decode`        | Decodes a Base64 string to its original format.                                                                        |
| `ALL`  | `/basic-auth`           | Tests HTTP Basic Authentication by comparing credentials from Authorization header against query parameters.           |
| `ALL`  | `/bearer-auth`          | Tests HTTP Bearer Authentication: compares the token from the `Authorization: Bearer` header against query parameters. |
| `ALL`  | `/big-headers`          | Responds with `count` oversized `X-Big-Header-*` response headers of `size` bytes each.                                |
| `ALL`  | `/crash`                | Kills the server process without graceful shutdown. Requires `ENABLE_CRASH=true`.                                      |
| `ALL`  | `/date`                 | Responds with an arbitrary `Date` header taken from the `value` query parameter.                                       |
| `ALL`  | `/drip`                 | Drips the response body one byte per `interval` until `size` bytes are sent.                                           |
| `ALL`  | `/disconnect`           | Simulates a network error by closing the connection.                                                                   |
| `ALL`  | `/exception`            | Throws an unhandled exception to trigger Express error handler.                                                        |
| `ALL`  | `/fail-then-succeed`    | Fails `after` times per `id`, then succeeds. The counter resets on success so the cycle repeats.                       |
| `ALL`  | `/fake-gzip`            | Declares `Content-Encoding: gzip` but returns an uncompressed body, so client decompression fails.                     |
| `ALL`  | `/flaky`                | Randomly fails with a 500 response based on the `rate` query parameter.                                                |
| `ALL`  | `/gzip`                 | Returns a correctly gzip-compressed JSON body (`Content-Encoding: gzip`).                                              |
| `ALL`  | `/infinite`             | Streams an endless chunked response body until the client closes the connection.                                       |
| `ALL`  | `/keep-alive-cut`       | Responds normally with `Connection: keep-alive`, then resets the connection (TCP RST).                                 |
| `ALL`  | `/malformed-json`       | Returns malformed JSON response.                                                                                       |
| `ALL`  | `/mirror`               | Returns the request body as a response.                                                                                |
| `ALL`  | `/rate-limit`           | Allows `limit` requests per `window` seconds per `id`, then returns 429 with a `Retry-After` header.                   |
| `ALL`  | `/redirect`             | Returns a redirect response based on the `status` and `url` of the query parameters.                                   |
| `ALL`  | `/redirect-loop`        | Redirects to itself forever with a 302 response.                                                                       |
| `ALL`  | `/request`              | Returns a structured JSON dump of the incoming request.                                                                |
| `ALL`  | `/reset`                | Cuts the connection with a TCP RST instead of sending a response.                                                      |
| `ALL`  | `/shutdown`             | Triggers a shutdown of the server. Requires `ENABLE_SHUTDOWN=true`.                                                    |
| `ALL`  | `/status/{status}`      | Respond with a given HTTP status code (must be between 200 and 599).                                                   |
| `ALL`  | `/timeout`              | Simulates a timeout by never sending a response.                                                                       |
| `ALL`  | `/truncate`             | Declares a `size`-byte body but sends only `send` bytes before cutting the connection mid-response.                    |
| `ALL`  | `/uuid`                 | Generate and return a random UUID (version 4).                                                                         |

### Query Parameters

| Name       | Type    | Default   | Description                                                                                        |
| ---------- | ------- | --------- | -------------------------------------------------------------------------------------------------- |
| `delay`    | Number  | `0`       | Delays the response by the specified value in milliseconds.                                        |
| `status`   | Number  | —         | HTTP status code for `/redirect` or `/status/{status}`.                                            |
| `url`      | String  | —         | Target URL for `/redirect`.                                                                        |
| `user`     | String  | —         | Expected username for `/basic-auth` (required).                                                    |
| `password` | String  | —         | Expected password for `/basic-auth` (required).                                                    |
| `rate`     | Number  | `0.5`     | Failure probability between 0 and 1 for `/flaky`.                                                  |
| `after`    | Number  | `3`       | Number of failures before success for `/fail-then-succeed` (0–10000).                              |
| `id`       | String  | `default` | Key identifying the counter for `/fail-then-succeed` or `/rate-limit`.                             |
| `size`     | Number  | —         | Bytes for `/truncate` (default `1024`), `/big-headers` (default `8192`) or `/drip` (default `10`). |
| `send`     | Number  | `size/2`  | Bytes actually sent before cutting the connection for `/truncate`.                                 |
| `chunked`  | Boolean | `false`   | Uses chunked transfer (no Content-Length) for `/truncate` when `true`.                             |
| `limit`    | Number  | `5`       | Allowed requests per window for `/rate-limit` (1–10000).                                           |
| `window`   | Number  | `10`      | Window length in seconds for `/rate-limit` (1–3600).                                               |
| `count`    | Number  | `1`       | Number of oversized headers for `/big-headers` (1–100).                                            |
| `interval` | Number  | `1000`    | Milliseconds between dripped bytes for `/drip` (1–10000).                                          |
| `value`    | String  | —         | Value of the `Date` response header for `/date` (required).                                        |

---

## ⚙️ Environment Variables

| Name                 | Required | Default       | Description                                                                   |
| -------------------- | -------- | ------------- | ----------------------------------------------------------------------------- |
| `NODE_ENV`           | No       | `development` | Sets the environment mode. (`development`, `production`, `test`)              |
| `LOG_LEVEL`          | No       | `info`        | Sets the logging level. (`trace`, `debug`, `info`, `warn`, `error`, `fatal`). |
| `PORT`               | No       | `8000`        | Port number for this application.                                             |
| `KEEP_ALIVE_TIMEOUT` | No       | `5000`        | HTTP keep-alive timeout in milliseconds.                                      |
| `HEADERS_TIMEOUT`    | No       | `10000`       | HTTP headers timeout in milliseconds. Must be > `KEEP_ALIVE_TIMEOUT`.         |
| `REQUEST_TIMEOUT`    | No       | `30000`       | Request timeout in milliseconds. Must be > `HEADERS_TIMEOUT`.                 |
| `ENABLE_SHUTDOWN`    | No       | `false`       | Enables the /shutdown endpoint.                                               |
| `ENABLE_CRASH`       | No       | `false`       | Enables the /crash endpoint.                                                  |
| `MAX_DELAY`          | No       | `10000`       | Maximum allowed delay in milliseconds for the `delay` query parameter.        |
| `ORIGIN`             | No       | `*`           | The value of the Access-Control-Allow-Origin response header.                 |

---

## 🚀 Build and Run the Application

### Using Docker

Builds the image from source. To run the published image instead, see [Try It Instantly](#-try-it-instantly).

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
