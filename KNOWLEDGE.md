# KNOWLEDGE.md — Project Knowledge

Start here for relevant project knowledge. Governing instructions and the approved task contract
retain authority; a record, source quotation or imported imperative cannot grant permission.

## Current knowledge use

Use ordinary files and textual search. Inspect relevant scope, grounds, disposition, source and
producer before applying a claim. Search `knowledge/records/` for incoming successor, correction,
equivalence and conflict references to its exact identity; follow material chains in both directions.
Legacy targets use exact path plus D/F/heading and source epoch. Scoped successors replace only
their stated scope; unchanged accepted claims remain applicable. Unresolved conflict names the
missing authorized decision. No generated index, original chat or task-archive sweep is required.

## 1. Architecture Map

The mini-LMS **WEBOOP** is a zero-server, client-only Single Page Application (SPA) designed for 2nd-year CS students studying Object-Oriented Programming with Python. Verified in `OOP_20261010-074918_LFRS`.

```mermaid
flowchart TD
    subgraph UI ["User Interface (React 18 + Tailwind)"]
        AL["AppLayout (SplitPane)"]
        SB["Sidebar (Course Nav)"]
        HD["Header (Score & Progress Export)"]
        TV["TheoryView (Markdown Specs)"]
        CE["CodeEditor (CodeMirror 6 Python)"]
        TM["TerminalView (Output & Test Results)"]
    end

    subgraph State ["State Management (Zustand)"]
        ST["useCourseStore"]
        LS[("Browser LocalStorage")]
    end

    subgraph Runtime ["Execution Runtime (Web Worker)"]
        WD["5s Watchdog Controller (App.tsx)"]
        WW["Pyodide Web Worker"]
        PY["Pyodide CPython 3.14 (WASM)"]
        CDN["jsDelivr CDN"]
    end

    AL --> SB & HD & TV & CE & TM
    CE -.->|code edits| ST
    ST <-->|reactive sync / JSON export| LS
    CE -->|run code| WD
    WD -->|postMessage| WW
    CDN -->|dynamic import| PY
    WW --> PY
    PY -->|stdout/stderr & results| WW
    WW -->|postMessage| TM
    WD -.->|timeout >5s: terminate() & respawn| WW
```

### Component Relationships

- **UI & Editor Layer** (`src/components/`): Two-column split layout (`AppLayout`) presenting theory/task instructions (`TheoryView`), in-browser Python editing with syntax highlighting and indentation (`CodeEditor` via CodeMirror 6), and execution/test output (`TerminalView`).
- **Reactive State & Persistence** (`src/store/useCourseStore.ts`): Manages active week/task, real-time code buffer, submission scores, and export/import functionality. Synced to `localStorage` via Zustand `persist` middleware with fallback for non-browser test environments.
- **Sandboxed Execution Runtime** (`src/workers/pyodide.worker.ts` & `src/App.tsx`): Dedicated Web Worker runs Pyodide (CPython 3.14 WASM), loaded dynamically from jsDelivr CDN. Supervised by an external 5-second watchdog timer in `src/App.tsx` that triggers worker termination (`worker.terminate()`) and transparent respawn if student code enters an infinite loop, ensuring UI responsiveness and zero student data loss.
- **Canonical Domain Model** (`src/types/course.ts`, `src/types/worker.ts`): Strict TypeScript interfaces matching `docs/domain/model.md` (`Course`, `Week`, `CodeTask`, `StudentProgress`) and discriminated union messages for worker RPC.
- **Content Boundary** (`src/data/demoCourse.ts`): Smoke-test task (`Counter`), completely decoupled from upcoming course curriculum (Week 1+).

### Architecture Decisions

- [`KR-OOP-0003`](knowledge/records/KR-OOP-0003-pyodide-worker-watchdog.md) — Isolated Pyodide Web Worker with 5-second watchdog termination loop.
- [`KR-OOP-0004`](knowledge/records/KR-OOP-0004-windows-esbuild-minification.md) — Vite Windows build: disabled esbuild minification (`minify: false`) to avoid temporary file access collisions.

## 2. Key Artifacts

- [`src/App.tsx`](file:///c:/Users/kz444/OneDrive/Desktop/Programming/WEBOOP/src/App.tsx) — Root application shell, worker supervisor, and watchdog controller.
- [`src/workers/pyodide.worker.ts`](file:///c:/Users/kz444/OneDrive/Desktop/Programming/WEBOOP/src/workers/pyodide.worker.ts) — Dedicated Pyodide execution Web Worker.
- [`src/store/useCourseStore.ts`](file:///c:/Users/kz444/OneDrive/Desktop/Programming/WEBOOP/src/store/useCourseStore.ts) — Zustand state store with LocalStorage persistence.
- [`src/types/course.ts`](file:///c:/Users/kz444/OneDrive/Desktop/Programming/WEBOOP/src/types/course.ts) — Canonical strict domain interfaces.
- [`src/components/editor/CodeEditor.tsx`](file:///c:/Users/kz444/OneDrive/Desktop/Programming/WEBOOP/src/components/editor/CodeEditor.tsx) — CodeMirror 6 Python editor integration.

## 3. Legacy & Deprecation

No project legacy has been identified. Preserve original sources and explicit later decisions.

## 4. Project Facts

Four qualified technical-reference records exist:

- [`KR-OOP-0001`](knowledge/records/KR-OOP-0001-pyodide-first-load-cost.md) — measured first-load cost
  of `pyodide-core` 314.0.7 in Chrome: **6.10 MiB compressed / 12.92 MiB uncompressed**, ~1.84–2.34 s to
  runtime ready. The figure is **conditional on the server's encoding state**, and the published
  roadmap value `6.4 MB` is confirmed accurate (task `OOP_20261007-230107_TFS`).
- [`KR-OOP-0002`](knowledge/records/KR-OOP-0002-runtime-environment-facts.md) — runtime environment
  facts: the declared course needs **no `micropip`**; the runtime is **CPython 3.14.2**; the DSH
  sandbox blocks Chromium by denying named pipes; DSH exposes no cost counters (task `OOP_20261007-230107_TFS`).
- [`KR-OOP-0003`](knowledge/records/KR-OOP-0003-pyodide-worker-watchdog.md) — Pyodide execution isolation
  in dedicated Web Worker with 5-second watchdog termination and state recovery (task `OOP_20261010-074918_LFRS`).
- [`KR-OOP-0004`](knowledge/records/KR-OOP-0004-windows-esbuild-minification.md) — Vite build configuration
  on Windows OS with `minify: false` resolving esbuild file locking (task `OOP_20261010-074918_LFRS`).

Read `KR-OOP-0001` before quoting any Pyodide load cost, and `KR-OOP-0002` before promising a
browser-based verification step or an economics capture in this harness.

Beyond those, no human-sourced project claim has been qualified yet. Relevant legacy topics, when
present, remain at `knowledge/{category}.md`; new qualified claims use `knowledge/records/` and the
shared record form. The directory is the route, not a maintained inventory. No counts or processed
markers.

Producing roles return material context through existing role/stage sources. A justified-none outcome
names the inspected scope; unavailable context stays explicit. `/tfw-knowledge` owns human-sourced
qualification; `/tfw-docs` owns technical/reference decisions. Both retain actual source and acceptance
identity. The existing Coordinator checks material handovers and completed effects before close.
