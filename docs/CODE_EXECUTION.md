# Alpha code execution

Coding challenges execute entirely in the learner's browser. No submitted code is executed inside an application/server process.

## TypeScript / JavaScript

- TypeScript is transpiled in-browser with the TypeScript compiler.
- Resulting JavaScript executes in a disposable Web Worker.
- The worker is terminated after the challenge wall-clock limit.
- Test results are returned to the UI and persisted as local learning evidence.

## Python

- Python executes with Pyodide (CPython compiled to WebAssembly) inside a disposable Web Worker.
- Pyodide loads from its public CDN on each disposable Python worker in this alpha, so Python requires network access.
- Python gets a minimum 15-second wall-clock allowance to include runtime bootstrap; this is not presented as a 15-second algorithm budget.

## Security boundary

This is an alpha learning sandbox, not a hostile multi-tenant code-execution service. Browser workers isolate execution from the React UI and the server does not execute learner code, but workers are not a complete security boundary against deliberately malicious code running in the learner's own browser. Before multi-user commercialization, move execution to a hardened sandbox such as isolated containers/microVMs with CPU, memory, network and filesystem limits.

## Test visibility

`hidden: true` means hidden from the normal result presentation, not cryptographically secret: test definitions ship with the client bundle. That is acceptable for the single-user career alpha but not for a competitive assessment product.
