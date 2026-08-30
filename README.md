# SDE → FDE

A career-first, hands-on software-engineering learning environment for an experienced QA/SDET/automation engineer transitioning toward deeper software engineering, backend/platform, AI engineering, Forward Deployed Engineering, and technical leadership.

## North star

This project succeeds if the learner becomes measurably better at **understanding, designing, implementing, debugging, retaining, and explaining real software systems**. Commercialization is secondary.

## Learning loop

**Problem → attempt → failure → hint → discovery → explanation → delayed recall → mastery**

The app treats existing automation/cloud/enterprise experience as leverage. It does not make an experienced engineer restart from beginner lessons unless evidence shows the fundamentals are actually missing.

## What Alpha 1.0 contains

- practical diagnostic across all ten skill areas
- evidence-backed skill profile; `unknown` is different from weak
- adaptive four-week roadmap plus a directional 52-week career compass
- 20 core hands-on learning missions plus DSA reinforcement
- staged backend/platform, AI-engineering, and FDE boss missions
- TypeScript/JavaScript execution in disposable browser workers
- Python execution through Pyodide
- deterministic visible/hidden challenge tests
- progressive six-level hints
- optional server-side AI tutor evaluation
- local rubric fallback when no AI key is configured
- XP, levels, streaks and badges tied to demonstrated work
- spaced active-recall reviews that require fresh evidence
- career-readiness evidence across eight capability areas
- JSON export/import for local learner progress
- CI tests for curriculum, progression, retention and build integrity

## Run locally

Requirements: Node.js 22+.

```bash
npm install
npm run dev
```

Open the URL printed by the server. The app works without an AI key: deterministic coding tests and local rubric feedback remain available.

### Optional live AI tutor

Copy `.env.example` into your environment and set `OPENAI_API_KEY`. You can optionally override `OPENAI_MODEL`. Never put the key in client-side code.

The server exposes `/api/health` so a deployment can verify that the app is running and whether live AI is configured without returning the secret.

## Build and verify

```bash
npm test
npm run build
npm start
```

CI runs both the unit/smoke tests and the production build on pull requests.

## Learning data

Alpha 1.0 intentionally has no account system. Learner state is stored in browser local storage. Use **Export progress** on the dashboard to create a JSON backup and **Import backup** to restore it in another browser. Do not edit the backup unless you understand the schema; imports perform basic validation but this is not a hardened multi-user data format.

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the minimal Node/Replit deployment model and security boundaries.

## How to judge whether this project is working

Do not judge it by pages viewed, lessons consumed, or XP alone. Use the first-month acceptance criteria in [`docs/FIRST_MONTH.md`](docs/FIRST_MONTH.md): voluntary return rate, evidence growth, reduced hint dependence, delayed recall, implementation fluency, and improved ability to explain tradeoffs.

## Product boundary

Still intentionally absent: payments, organizations, multi-tenancy, sophisticated authentication, native mobile apps, social/community features, and microservices. Those are product-business concerns, not prerequisites for the primary learner's career journey.
