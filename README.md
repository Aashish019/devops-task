# DevOps Task — Containerized Node.js App

A minimal Express app, containerized, tested in CI, and run locally via Docker Compose.

## Project structure

```
.
├── app.js                       # Express app (with request logging middleware)
├── app.test.js                  # Jest + Supertest test for /health
├── package.json
├── package-lock.json
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .github/workflows/ci.yml     # CI pipeline
└── README.md
```

## Running locally (without Docker)

```bash
npm install
npm start
```

The app will be available at `http://localhost:3000`.

- `GET /` → `{ "message": "Hello, DevOps!" }`
- `GET /health` → `{ "status": "ok" }` (HTTP 200)

To run the test suite:

```bash
npm test
```

## Running locally (with Docker)

Build and run with plain Docker:

```bash
docker build -t devops-task-app .
docker run -p 3000:3000 devops-task-app
```

Or, preferably, with Docker Compose (includes the health check):

```bash
docker compose up --build
```

Check container health:

```bash
docker ps          # look at the STATUS column, e.g. "Up 10 seconds (healthy)"
```

Stop it with `docker compose down`.

## How the CI pipeline works

On every push (and pull request), `.github/workflows/ci.yml` runs on `ubuntu-latest` and does, in order:

1. **Checkout** the repository.
2. **Set up Node.js 24**, with npm dependency caching enabled for faster runs.
3. **Install dependencies** with `npm ci` (uses `package-lock.json` for reproducible, exact installs — faster and safer than `npm install` in CI).
4. **Run tests** (`npm test`), which runs Jest against `/health` and fails the pipeline if the endpoint doesn't return 200.
5. **Build the Docker image**, tagged with the commit SHA, to confirm the app is containerizable. (The image isn't pushed anywhere in this exercise — that would be the next logical step, e.g. pushing to Docker Hub / GHCR / ECR on merges to `main`.)

If any step fails, the whole workflow fails and shows up as a red ❌ on the commit/PR.

## Logging / observability (current state)

`app.js` includes a small logging middleware that logs, for every request:

- HTTP method
- Path
- Status code
- Response time in milliseconds

Example log line:

```
GET /health 200 - 3.78ms
```

This is enough for local debugging but isn't "monitoring" in a production sense — it's just console output.

## Extending this toward real production monitoring

To make this production-grade, I'd add structured (JSON) logging shipped to a log aggregator (e.g. CloudWatch Logs, or the ELK/EFK stack), and expose a `/metrics` endpoint using `prom-client` to track request rate, error rate, and latency percentiles (RED metrics), scraped by **Prometheus** and visualized in **Grafana** — or, if running on AWS, I'd lean on **CloudWatch** metrics/alarms instead of self-hosting Prometheus. I'd also add uptime/health alerting (e.g. via Alertmanager or a simple external uptime check) so failures page someone rather than sitting silently in logs, and track container-level metrics (CPU/memory) via cAdvisor or the cloud provider's built-in container insights.

## Assumptions & trade-offs

- **Base image**: used `node:24-alpine` for a small image size rather than a full Debian/Ubuntu-based Node image. Alpine lacks some tools (like `curl`), which is why the Compose health check uses a small Node one-liner instead.
- **Non-root**: the Dockerfile uses a multi-stage build and runs the final container as the built-in non-root `node` user (`USER node`), rather than root, for basic image hardening.
- **No registry push**: the CI pipeline builds the image to validate it, but doesn't push it to a container registry — out of scope for "build/test," but would be the natural next CI/CD step (e.g. push to GHCR on merge to `main`).
- **Single test**: only one test (`/health` returns 200) as explicitly requested. In a real project I'd add tests for `/` and for error cases.
- **In-memory app, no persistence**: no database or external state, so no volumes are needed in Compose.
