# AI tutor behavior

The tutor is designed to preserve productive struggle rather than act as an answer generator.

## Assistance ladder

1. Conceptual hint
2. Directional hint
3. Specific hint
4. Pseudocode / structured steps
5. Partial solution
6. Full solution / exemplar

The learner must have a non-empty attempt before hints unlock, and the UI only exposes the next level sequentially.

## Evaluation contract

For open-ended attempts, the tutor returns:

- concise summary
- specific strengths
- missing considerations
- formal terminology worth attaching to the learner's ideas
- justified misconception tags
- one Socratic follow-up question
- qualitative skill evidence: `strong`, `partial`, `weak`, or `unknown`

It intentionally does **not** return a fake 0–10 mastery score.

## AI configuration

The Node server calls the OpenAI Responses API when `OPENAI_API_KEY` is configured. `OPENAI_MODEL` defaults to `gpt-5.6-luna` and can be overridden.

The browser never receives the API key.

When the AI endpoint is unavailable, the UI degrades visibly to:

- challenge-specific pre-authored progressive hints
- a lightweight keyword/rubric check labeled **Offline rubric check**

That fallback is intentionally described as provisional evidence; it is not presented as semantic AI grading.

## Privacy / employer boundaries

Tutor instructions explicitly prohibit requesting, inferring or reproducing confidential employer information. Scenarios should be synthetic/generalized even when inspired by prior professional experience.
