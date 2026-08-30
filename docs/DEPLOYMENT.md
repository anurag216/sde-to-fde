# Deployment

Alpha 1.0 is deliberately a single Node application: Express serves the tutor/health API and, in production, the built Vite frontend. This is sufficient for the primary learner and avoids introducing product infrastructure before it is needed.

## Runtime

- Node.js 22+
- install dependencies with `npm install`
- build with `npm run build`
- start with `npm start`
- set `PORT` when the host requires a specific port
- the server binds to `0.0.0.0` so managed hosts such as Replit can route to it

## Optional environment

- `OPENAI_API_KEY`: enables live semantic tutor evaluation/hints
- `OPENAI_MODEL`: optional model override

If no OpenAI key exists, `/api/tutor` returns a controlled 503 and the browser uses local challenge rubrics/pre-authored hints. The learning environment is therefore still usable without paid AI access.

Never expose `OPENAI_API_KEY` through Vite/client environment variables.

## Health check

`GET /api/health`

The response reports:

- whether the service is healthy
- application version
- whether live AI tutoring is configured
- the configured model name only when AI is enabled

It never returns the API key.

## Replit

The repository is compatible with a simple Replit Node deployment:

1. Import the GitHub repository into Replit.
2. Use Node 22 or newer.
3. Set the run command to `npm run dev` for the workspace preview.
4. For deployment, use the production build/start flow (`npm run build`, then `npm start`).
5. Add `OPENAI_API_KEY` as a Replit Secret only if live AI tutoring is desired.
6. Verify `/api/health` before using the hosted app.

The primary learner's progress is still browser-local. Export a progress backup before switching browsers/devices or clearing site storage.

## Code execution boundary

JavaScript/TypeScript learner code runs in disposable browser Web Workers. Python uses Pyodide in a browser worker. The current design uses wall-clock termination and does not execute learner code in the Express server process.

This is appropriate for a single-user career alpha. It is **not** a hardened hostile multi-user sandbox. Before commercializing the product, isolate untrusted execution in a purpose-built sandbox/container service with CPU, memory, syscall/network and filesystem controls.

## Production boundary for Alpha 1.0

Reasonable now:

- one Node process
- one learner/browser
- browser-local progress
- optional server-side tutor key
- deterministic CI

Not justified yet:

- database-backed user accounts
- multi-tenancy
- Kubernetes
- microservices
- payments
- enterprise SSO
- centralized code-execution workers

Those should only be added after the learning loop proves valuable to the primary learner.
