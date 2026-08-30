# Alpha code execution

Coding challenges execute entirely in the learner's browser. No submitted code is executed inside an application/server process.

## TypeScript / JavaScript

- TypeScript is transpiled in-browser with the TypeScript compiler.
- The resulting JavaScript is executed in a disposable Web Worker.
- The worker is terminated after the challenge time limit (currently 2 seconds).
- Test results are returned to the UI and persisted as local learning evidence.

## Python

- Python is executed with Pyodide (CPython compiled to WebAssembly) inside a disposable Web Worker.
- Pyodide is loaded from its public CDN on the first Python run, so Python execution requires network access.
- The same wall-clock timeout terminates the worker.

## Security boundary

This is an alpha learning sandbox, not a hostile multi-tenant code-execution service. Browser workers isolate execution from the React UI and the server does not execute learner code, but workers are not a complete security boundary against deliberately malicious code running in the learner's own browser. Before multi-user commercialization, move execution to a hardened sandbox (for example isolated containers/microVMs with CPU, memory, network and filesystem limits).

## Test visibility

`hidden: true` currently means hidden from the normal UI, not cryptographically secret: test definitions ship with the client bundle. That is appropriate for the single-user career alpha but not for a competitive assessment product.
