# HTTP Playground Server

[![CI](https://github.com/ryo8000/http-playground-server/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/ryo8000/http-playground-server/actions/workflows/pr-checks.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An HTTP server for testing how your client handles **real-world failures**: timeouts, TCP resets, truncated bodies, flaky 500s, rate limits, and more — no configuration needed. Start it, point your HTTP client at it, and find out whether your retry, timeout, and error-handling logic actually works.

Built with **Node.js** and **Express**.

---

## 🚀 Quick Start

### Using Docker

```bash
git clone https://github.com/ryo8000/http-playground-server.git
cd http-playground-server
docker build -t http-playground-server .
docker run -p 8000:8000 http-playground-server
```

### Using Yarn

```bash
git clone https://github.com/ryo8000/http-playground-server.git
cd http-playground-server
yarn install
yarn build
node dist/server.js
```

Then list all available endpoints:

```bash
curl http://localhost:8000/
```

---

## 💡 Why not just use httpbin?

[httpbin](https://httpbin.org/) is great for inspecting requests and simulating status codes. This server focuses on the failure modes httpbin can't reproduce — the ones that actually break clients in production:

| Capability                                                          | http-playground-server | httpbin¹ | httpstat.us |
| ------------------------------------------------------------------- | :---------------------: | :------: | :---------: |
| Arbitrary status codes, delays, redirects                           |            ✅            |    ✅    |     ✅      |
| Request inspection, auth, cookies, caching                          |            ✅            |    ✅    |     ❌      |
| TCP reset instead of a response (`/reset`, `/keep-alive-cut`)       |            ✅            |    ❌    |     ❌      |
| Truncated / corrupted bodies (`/truncate`, `/fake-gzip`)            |            ✅            |    ❌    |     ❌      |
| Retry testing (`/flaky`, `/fail-then-succeed`, `/rate-limit`)       |            ✅            |    ❌    |     ❌      |
| Failure injection on _any_ endpoint (`?delay=`, `?flaky=`)          |            ✅            |    ❌    |     ❌      |
| Server-Sent Events (`/sse`)                                         |            ✅            |    ❌    |     ❌      |

¹ The original Python httpbin. Some forks (e.g. go-httpbin) cover parts of this list.

---

## 🧪 Examples

```bash
# Fail with a 500 about 30% of the time — does your retry logic cope?
curl -i 'http://localhost:8000/uuid?flaky=0.3'

# Fail 3 times, then succeed — exactly what a retry-with-backoff test needs
curl -i 'http://localhost:8000/fail-then-succeed?after=3'

# 429 with a Retry-After header after 5 requests in 10 seconds
curl -i 'http://localhost:8000/rate-limit?limit=5&window=10'

# TCP reset instead of a response
curl -i 'http://localhost:8000/reset'

# Declare a 1024-byte body but cut the connection after 512 bytes
curl -i 'http://localhost:8000/truncate?size=1024&send=512'

# Stream 3 Server-Sent Events, one every 500 ms
curl -N 'http://localhost:8000/sse?count=3&interval=500'

# Delay any endpoint by 2 seconds
curl -i 'http://localhost:8000/status/200?delay=2000'
```

---

## 📚 API Reference

Every endpoint accepts **any HTTP method** unless noted otherwise.

### Global query parameters

These work on **every** endpoint and can be combined with endpoint-specific parameters:

| Name    | Type   | Default | Description                                                          |
| ------- | ------ | ------- | -------------------------------------------------------------------- |
| `delay` | Number | `0`     | Delays the response by the specified value in milliseconds (capped by `MAX_DELAY`). |
| `flaky` | Number | —       | Fails the request with a 500 response with the given probability (0–1). |

### Echo & utility

#### `/`

Returns a JSON list of all available endpoints.

#### `/request`

Returns a structured JSON dump of the incoming request (method, headers, query, body, etc.).

#### `/mirror`

Returns the request body as the response body.

#### `/uuid`

Generates and returns a random UUID (version 4).

#### `/base64/encode`, `/base64/decode`

Encodes/decodes a string to/from Base64. Send the input as a plain-text body or as JSON: `{"value": "..."}`.

### Response simulation

#### `/status/{status}`

Responds with the given status code (200–599). Pass a comma-separated list to get one of them at random:

```bash
curl -i http://localhost:8000/status/200,500,503
```

#### `/redirect`

Returns a redirect response.

| Name     | Type   | Default | Description                                             |
| -------- | ------ | ------- | ------------------------------------------------------- |
| `url`    | String | —       | Target URL (required).                                  |
| `status` | Number | `302`   | Redirect status code (301, 302, 303, 307 or 308).       |

#### `/cache`

Returns `ETag` and `Last-Modified` headers. When the request carries `If-None-Match` or `If-Modified-Since`, responds with `304 Not Modified` instead.

| Name   | Type   | Default           | Description                          |
| ------ | ------ | ----------------- | ------------------------------------ |
| `etag` | String | `http-playground` | Value used for the `ETag` header.    |

#### `/cache/{seconds}`

Responds with a `Cache-Control: public, max-age={seconds}` header (0–31536000).

#### `/cookies`

Returns the cookies sent with the request.

#### `/cookies/set`

Sets one cookie per query parameter and echoes them back: `/cookies/set?flavor=chocolate`.

#### `/cookies/delete`

Expires the cookies named by the query parameters: `/cookies/delete?flavor=`.

#### `/gzip`

Returns a correctly gzip-compressed JSON body (`Content-Encoding: gzip`).

#### `/sse`

Streams Server-Sent Events, then closes the connection.

| Name       | Type   | Default | Description                                    |
| ---------- | ------ | ------- | ---------------------------------------------- |
| `count`    | Number | `5`     | Number of events to send (1–100).              |
| `interval` | Number | `1000`  | Milliseconds between events (1–10000).         |

#### `/drip`

Drips the response body one byte at a time.

| Name       | Type   | Default | Description                                    |
| ---------- | ------ | ------- | ---------------------------------------------- |
| `size`     | Number | `10`    | Total body size in bytes (1–1024).             |
| `interval` | Number | `1000`  | Milliseconds between bytes (1–10000).          |

#### `/big-headers`

Responds with oversized `X-Big-Header-*` response headers.

| Name    | Type   | Default | Description                                |
| ------- | ------ | ------- | ------------------------------------------ |
| `count` | Number | `1`     | Number of oversized headers (1–100).       |
| `size`  | Number | `8192`  | Size of each header value in bytes.        |

#### `/date`

Responds with an arbitrary `Date` header.

| Name    | Type   | Default | Description                                    |
| ------- | ------ | ------- | ---------------------------------------------- |
| `value` | String | —       | Value of the `Date` response header (required). |

### Authentication

#### `/basic-auth`

Tests HTTP Basic Authentication: compares the credentials from the `Authorization` header against the query parameters and returns 200 or 401 (with a `WWW-Authenticate` challenge).

| Name       | Type   | Default | Description                   |
| ---------- | ------ | ------- | ----------------------------- |
| `user`     | String | —       | Expected username (required). |
| `password` | String | —       | Expected password (required). |

#### `/bearer-auth`

Tests HTTP Bearer Authentication: compares the token from the `Authorization: Bearer` header against the query parameter and returns 200 or 401 (with a `WWW-Authenticate` challenge).

| Name    | Type   | Default | Description                |
| ------- | ------ | ------- | -------------------------- |
| `token` | String | —       | Expected token (required). |

### Failure & chaos

#### `/flaky`

Randomly fails with a 500 response.

| Name   | Type   | Default | Description                          |
| ------ | ------ | ------- | ------------------------------------ |
| `rate` | Number | `0.5`   | Failure probability between 0 and 1. |

#### `/fail-then-succeed`

Fails `after` times per `id`, then succeeds. The counter resets on success so the cycle repeats — ideal for testing retry-with-backoff.

| Name    | Type   | Default   | Description                            |
| ------- | ------ | --------- | -------------------------------------- |
| `after` | Number | `3`       | Number of failures before success.     |
| `id`    | String | `default` | Key identifying the failure counter.   |

#### `/rate-limit`

Allows `limit` requests per `window` seconds per `id`, then returns 429 with a `Retry-After` header.

| Name     | Type   | Default   | Description                                 |
| -------- | ------ | --------- | ------------------------------------------- |
| `limit`  | Number | `5`       | Allowed requests per window (1–10000).      |
| `window` | Number | `10`      | Window length in seconds (1–3600).          |
| `id`     | String | `default` | Key identifying the rate-limit counter.     |

#### `/error/timeout`

Simulates a timeout by never sending a response.

#### `/error/network`

Simulates a network error by closing the connection.

#### `/error/malformed-json`

Returns a malformed JSON response.

#### `/error/error`

Throws an unhandled exception to trigger the Express error handler.

#### `/fake-gzip`

Declares `Content-Encoding: gzip` but returns an uncompressed body, so client decompression fails.

#### `/truncate`

Declares a `size`-byte body but sends only `send` bytes before cutting the connection mid-response.

| Name      | Type    | Default  | Description                                             |
| --------- | ------- | -------- | ------------------------------------------------------- |
| `size`    | Number  | `1024`   | Declared body size in bytes.                            |
| `send`    | Number  | `size/2` | Bytes actually sent before cutting the connection.      |
| `chunked` | Boolean | `false`  | Uses chunked transfer (no Content-Length) when `true`.  |

#### `/reset`

Cuts the connection with a TCP RST instead of sending a response.

#### `/keep-alive-cut`

Responds normally with `Connection: keep-alive`, then resets the connection (TCP RST).

#### `/redirect-loop`

Redirects to itself forever with a 302 response.

#### `/infinite`

Streams an endless chunked response body until the connection is closed (bounded by `REQUEST_TIMEOUT`).

#### `/crash`

Kills the server process without graceful shutdown. Requires `ENABLE_CRASH=true`.

#### `/shutdown`

Triggers a graceful shutdown of the server. Requires `ENABLE_SHUTDOWN=true`.

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

## 🧑‍💻 Development

For developer-specific instructions, including details on testing and project structure, see the [Development Guide](./docs/DEVELOPMENT_GUIDE.md).

---

## 📜 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
