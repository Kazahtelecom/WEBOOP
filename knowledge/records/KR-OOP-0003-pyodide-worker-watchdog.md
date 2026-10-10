# Knowledge record — KR-OOP-0003: Pyodide Web Worker isolation with 5-second watchdog termination

> One material claim/decision and its completed or explicitly unresolved disposition.
> Presence is not acceptance. Fill applicable fields; reasoned N/A only when inapplicable.

| Field | Value |
|---|---|
| Record identity | `KR-OOP-0003` (locally allocated under `knowledge/records/`) |
| Publication intent | Document the architectural decision to isolate Python execution in a dedicated Web Worker supervised by a 5-second watchdog timer on the main thread, preventing infinite loops or long-running student scripts from freezing the browser UI while preserving progress; retain on equal retry |
| Kind | technical-reference decision |
| Statement | In the zero-server browser LMS, Pyodide (CPython 3.14 WASM) runs in a dedicated Web Worker (`src/workers/pyodide.worker.ts`). Python execution is supervised by a 5-second watchdog timer on the main UI thread (`src/App.tsx`). If execution exceeds 5 seconds (such as an accidental `while True`), the main thread terminates the worker via `worker.terminate()`, alerts the user in the terminal, and respawns a fresh worker instance. The UI remains responsive and student state (active code, completed tasks, score) in Zustand/LocalStorage is preserved without data loss. |
| Applicability | Project WEBOOP, all browser runtimes executing student Python code across all course weeks. |
| Grounds and uncertainty | Verified by unit and smoke tests in task `OOP_20261010-074918_LFRS` (E3, E6), reviewed and approved in `REVIEW__OOP_20261010-074918_LFRS.md`. Respawns require a brief reinitialization of Pyodide WASM from browser HTTP cache (~1.8–2.3 s as measured in KR-OOP-0001). **Uncertainty:** Memory limits for intensive student allocations depend on host browser WebAssembly limits. |
| Disposition | accepted |
| Source | `RF__OOP_20261010-074918_LFRS.md` §2 item 4; `src/App.tsx`; `src/workers/pyodide.worker.ts`; Candidate commit `7baefec3c74074691d6226352035686f5f96a9b7`. |
| Originating task and unit | `OOP_20261010-074918_LFRS`, Executor `antigravity:executor:local:OOP_20261010-074918_LFRS` |
| Producer | Coordinator `antigravity:coordinator:local:OOP_20261010-074918_LFRS` |
| Qualifier | Reviewer `antigravity:reviewer:local:OOP_20261010-074918_LFRS`, ruling APPROVE in `REVIEW__OOP_20261010-074918_LFRS.md` |
| Acceptance authority | Owner `zhassulan` |
| Completed effect or missing decision | Published under `knowledge/records/KR-OOP-0003-pyodide-worker-watchdog.md` and referenced in `KNOWLEDGE.md`. |
| Relations | Complements `KR-OOP-0002` (runtime environment facts). No conflicting records. |

## Source and decision context

Running user-supplied Python code in a browser-only SPA presents a major stability risk: an infinite loop or heavy blocking calculation on the main thread freezes the entire browser tab, preventing interaction, console viewing, or progress saving. Executing Pyodide inside a dedicated Web Worker isolates execution from the React rendering thread. Coupling this with an external 5-second watchdog timer in `App.tsx` guarantees that unresponsive scripts can be forcibly stopped via `terminate()` without relying on Python-side cooperative interruption, and the worker can be immediately respawned.

## Relations and current use

Read this record before designing test runners, exercise evaluation suites, or exam anti-cheat mechanisms. Current use: referenced by `KNOWLEDGE.md` Architecture Map and Architecture Decisions.

## Retry and continuation

An equal retry reuses this architectural pattern: keep Pyodide execution in `src/workers/pyodide.worker.ts` and maintain the 5-second watchdog supervisor in `src/App.tsx`. A divergent intent — such as adding SharedArrayBuffer-based cooperative interruption or WebAssembly memory boundaries — requires a new technical decision record.
