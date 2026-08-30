# Alpha roadmap

## Alpha 0.1 — Diagnostic shell ✅

Goal: create a place where the primary learner can begin the journey instead of doing the journey in chat.

- [x] Career-first dashboard
- [x] Skill graph taxonomy
- [x] Mixed diagnostic challenge schema
- [x] Local persistence
- [x] Objective scoring where deterministic

## Alpha 0.2 — Real evaluator ✅

- [x] Browser-isolated execution for TypeScript/JavaScript and Python challenge code
- [x] Test-case result UI
- [x] AI evaluation for free-response/design answers when an API key is configured
- [x] Local rubric fallback so the app remains usable without paid AI
- [x] Progressive hints with assistance-level tracking
- [x] Misconception tags and attempt history

## Alpha 0.3 — Evidence-backed baseline ✅

- [x] Skill profile generated from stored evidence
- [x] Confidence separate from mastery
- [x] Implementation/vocabulary/design/retention gaps tracked separately
- [x] Evidence-driven first 4-week plan
- [x] Career-path weighting without permanently locking a path

## Alpha 0.4 — Mission engine ✅

- [x] First 20 core learning challenges
- [x] Engineering + DSA mission library
- [x] Roadmap items launch into real challenges
- [x] XP, levels, streaks and badges tied to demonstrated work
- [x] Assistance-aware rewards
- [x] Delayed concept resurfacing in the adaptive cycle

## Alpha 0.5 — One-year career system ✅

- [x] Expanded diagnostic samples all ten major skill areas
- [x] Practical scenario-led assessment rather than trivia
- [x] 52-week compass with four quarters and quarterly boss outcomes
- [x] Adaptive four-week cycles remain the executable route
- [x] Existing SDET/automation experience is explicitly treated as leverage

## Alpha 0.6 — Retention, bosses and next-role evidence ✅

- [x] Dedicated spaced-retention queue after mission completion
- [x] Review requires fresh active-recall evidence, not opening an old answer
- [x] Hard/okay/easy recall ratings adapt the next review interval
- [x] Reviews never re-award mission XP
- [x] Retention evidence feeds back into the skill profile
- [x] Three staged boss missions: backend/platform, AI engineering, and FDE
- [x] Boss constraints are revealed sequentially instead of upfront
- [x] Career-readiness scorecard covers eight real capability areas
- [x] Readiness keeps untested areas `unknown` instead of manufacturing weakness scores
- [x] CI tests retention scheduling, boss progression and readiness invariants

## Next: Alpha 1.0 — career MVP hardening

- [ ] Add health/status endpoint and deploy/run documentation
- [ ] Add deterministic smoke test for API fallback and production build
- [ ] Add learner data export/import so local progress is portable
- [ ] Improve challenge authoring validation so bad curriculum data fails CI
- [ ] Create a first-month acceptance checklist for the primary learner
- [ ] Deploy a usable hosted alpha after repository checks are green

## Still do not build

- payments
- multi-tenant organizations
- sophisticated authentication
- native mobile apps
- social/community features
- elaborate branding
- microservices

We should earn product complexity only after the career-learning loop proves useful to the primary learner.
