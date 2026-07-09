# DevOps Task — Containerized Node.js App

A minimal Express app, containerized, tested in CI, and run locally via Docker Compose.

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
