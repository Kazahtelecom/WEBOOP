# Map — "What must be true?"
> **Mindset:** Experienced newcomer. Understand the accepted result before judging it.
> **Test:** "Can I name the material claims, harms, boundaries, evidence identities and limits?"
> RF: [RF__OOP_20261010-074918_LFRS.md](../RF__OOP_20261010-074918_LFRS.md)
> TS: [TS__OOP_20261010-074918_LFRS.md](../TS__OOP_20261010-074918_LFRS.md)

## Understanding

The accepted subject is the complete client-first foundational runtime skeleton of WEBOOP LMS, implementing a browser-only SPA with React 18, Vite, Tailwind CSS, Zustand, CodeMirror 6, and a Web Worker running Pyodide CPython 3.14. Its purpose is to deliver a verified, zero-server programming environment for 2nd-year students before any Week 1 course content is introduced. Key decisions include Web Worker sandboxing with a 5-second watchdog termination loop, jsDelivr CDN delivery of Pyodide WASM, and reactive LocalStorage persistence with JSON backup.

## Accepted Claims and Boundaries

| ID | Layer | Accepted claim / authority boundary | Risk or concrete harm | Affected behavior / dependencies | Relevant environment | Oracle / authority | Evidence identity (`subject@revision`, source) | Required? |
|---|---|---|---|---|---|---|---|---|
| C1 | VALUE | Local-first browser runtime without backend or DB (DoF 1) | Violation of North Star, unexpected server costs or deployment burdens | Core app initialization (`App.tsx`, `main.tsx`) | Browser (Chrome/Firefox/Edge) | HL §1, §6; TS §2, §7 | `7baefec3c74074691d6226352035686f5f96a9b7` in `package.json`, `src/App.tsx` | yes |
| C2 | VALUE | Domain models in `src/types/course.ts` and `src/types/worker.ts` match `docs/domain/model.md` without `any` (AC-2, DoF 5) | Type drift, runtime regressions in future tasks, loose typing | Type system across store, worker, UI | TypeScript 5.6 strict | `docs/domain/model.md`, TS §5 AC-2 | `7baefec3c74074691d6226352035686f5f96a9b7` in `src/types/course.ts`, `src/types/worker.ts` | yes |
| C3 | VALUE | Web Worker runs Pyodide CPython 3.14 with stdout/stderr capture and 5s watchdog with terminate & restart (AC-3, DoF 2, DoF 3) | Main thread lockup on infinite loops (`while True:`), uncaught errors | `pyodide.worker.ts`, `App.tsx` worker lifecycle | Web Worker / Pyodide WASM | TS §5 AC-3, HL §5 DoD 4, 5 | `7baefec3c74074691d6226352035686f5f96a9b7` in `src/workers/pyodide.worker.ts`, `src/App.tsx` | yes |
| C4 | VALUE | Zustand store with real-time `localStorage` persistence, JSON export/import and zero data loss on F5 (AC-4, DoF 4) | Student code loss on page reload or browser restart | `useCourseStore.ts`, `Header.tsx`, `CodeEditor.tsx` | Browser LocalStorage / Node mock | TS §5 AC-4, HL §5 DoD 6 | `7baefec3c74074691d6226352035686f5f96a9b7` in `src/store/useCourseStore.ts` | yes |
| C5 | VALUE | SplitPane UI shell with TheoryView, CodeEditor, TerminalView, Sidebar, and Header score badge (AC-5) | Broken responsive layout, non-interactive editor or terminal | UI components in `src/components/` | Vite dev / preview build | TS §5 AC-5, HL §3.1 | `7baefec3c74074691d6226352035686f5f96a9b7` in `src/components/**` | yes |
| C6 | VALUE | Demo module (`demoCourse.ts`) verifies end-to-end Counter task without Week 1 content (AC-6, DoF 6) | Premature leakage of unvetted curriculum content | `src/data/demoCourse.ts` | SPA Runtime | TS §5 AC-6, HL §5 DoD 9, DoF 6 | `7baefec3c74074691d6226352035686f5f96a9b7` in `src/data/demoCourse.ts` | yes |
| C7 | ASSURANCE | Production build (`vite build`), typecheck, lint, and Vitest test suites pass with 0 errors/warnings (AC-1) | Unbuildable bundle or failing tests in CI/developer environment | `vite.config.ts`, `tsconfig.json`, `tests/` | Node v24, npm 11 | TS §5 AC-1, HL §5 DoD 2 | `7baefec3c74074691d6226352035686f5f96a9b7`, `dist/` | yes |
| C8 | TRACE | Value-bearing accounting: 22 VALUE files, 1856 LOC, 0 out-of-scope files, Candidate `7baefec` | Accounting drift, boundary violation | Git repository history | Git CLI | TS §4, conventions.md §6 | `de0ffa49..7baefec3` | yes |
| C9 | TRACE | Human acceptance authority: approved by owner `zhassulan` on frozen HL/TS baseline | Usurpation of product owner authority | Task control files | `status.md`, `HL-OOP_...md` | Owner signature in `status.md`, HL §4.1 | yes |
| C10 | VALUE | Mandatory safety/security boundary: isolated client execution, no credentials, no network backdoors | Security compromise or arbitrary remote execution vulnerability | Web Worker script execution sandbox | Browser sandbox | OWASP / TFW safety floor | `7baefec3c74074691d6226352035686f5f96a9b7` in `pyodide.worker.ts` | yes |
| C11 | TRACE | Accepted-result identity: Candidate commit is `7baefec3c74074691d6226352035686f5f96a9b7` | Evaluating wrong commit or uncommitted dirty state | Git HEAD and worktree | Git log | Candidate SHA in RF §1, EV §1 | yes |

## TS ↔ RF Alignment

| TS requirement | RF claim | Claim IDs | Aligned? |
|---|---|---|---|
| AC-1: Build infrastructure & tooling | RF §1, §3 AC-1, §4, §5 E1 | C7 | ✅ |
| AC-2: Domain types & worker protocol | RF §1, §3 AC-2, §4, §5 E2 | C2 | ✅ |
| AC-3: Web Worker Pyodide & watchdog | RF §1, §2 #4, §3 AC-3, §5 E3 | C3, C10 | ✅ |
| AC-4: Zustand state & LocalStorage | RF §1, §2 #3, §3 AC-4, §5 E4 | C4 | ✅ |
| AC-5: Two-pane UI shell & CodeMirror | RF §1, §3 AC-5, §5 E5 | C5 | ✅ |
| AC-6: Demo task integration | RF §1, §3 AC-6, §5 E6 | C6 | ✅ |
| DoF 1: No server backend / database | RF §1, §2 #2 | C1, C10 | ✅ |
| DoF 2: No Pyodide on main thread | RF §1, §3 AC-3, §5 E3 | C3 | ✅ |
| DoF 3: No tab freeze on `while True:` | RF §1, §2 #4, §5 E3 | C3 | ✅ |
| DoF 4: Zero student code loss on F5 | RF §1, §3 AC-4, §5 E4 | C4 | ✅ |
| DoF 5: No `any` type in codebase | RF §1, §3 AC-2, §4 Lint/Types | C2 | ✅ |
| DoF 6: No Week 1 curriculum content | RF §1, §3 AC-6, §5 E6 | C6 | ✅ |
| Value-Bearing Accounting | RF §1 Actual Accounting | C8, C11 | ✅ |

## Verification Selection

| Claim IDs | Planned check or reusable evidence | Why this depth | Known gap or limit |
|---|---|---|---|
| C1, C10 | Static inspection of dependencies (`package.json`), backend absence, and network calls in worker/UI | Mandatory safety and architectural North Star boundary | CDN fetch of Pyodide is expected and allowed |
| C2 | Run `npm run typecheck` and inspect `src/types/course.ts` against `docs/domain/model.md` | Strict typization is a core foundation guarantee | None |
| C3 | Independent audit of `src/workers/pyodide.worker.ts` and `App.tsx` watchdog termination logic | Concurrency and browser responsiveness are critical for students | Worker execution in headless Vitest tests requires mock; verified via static and unit tests |
| C4 | Run `npx vitest run tests/store.test.ts` and inspect LocalStorage persistence implementation | Guarantee against zero student data loss | None |
| C5 | Run `npm run build`, inspect bundle output and component implementation | Two-pane SplitPane and CodeMirror integration are user-facing | None |
| C6 | Inspect `src/data/demoCourse.ts` and verify absence of Week 1 content | Enforces DoF 6 and separation of foundation from content | None |
| C7 | Execute `npm run lint`, `npm run typecheck`, and `npx vitest run` | Mandatory assurance gate for compilable codebase | None |
| C8, C11 | Verify `git show --stat 7baefec` and diff arithmetic against TS §4 | Exact-path accounting and candidate identity | None |
| C9 | Audit `status.md` and `HL-OOP_...md` authority citations | Mandatory authority floor | None |

## Deviations from TS

No deviations. All 6 Acceptance Criteria and all 6 DoF constraints were addressed. In `vite.config.ts`, minification was set to `false` as a deliberate design decision to prevent Windows file-locking race conditions during build, which is documented in RF §2 Key Decision 1.

## Checkpoint

**Self-check:**
- [x] Read RF §§1–5, governing TS AC/DoF, HL purpose/principles, ONB and referenced predecessors?
- [x] Mapped every material accepted claim and the mandatory safety/security, authority and result-identity boundaries?
- [x] Bound each claim to affected behavior/dependencies, environment, oracle/authority and exact evidence identity?
- [x] Recorded a replayable verification selection and every known gap or limit?
- [x] Avoided classifying by filename, discrepancy count or artifact volume?

Stage complete: YES
