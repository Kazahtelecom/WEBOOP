# Knowledge record — KR-OOP-0002: runtime environment facts for the OOP course

> One material claim/decision and its completed or explicitly unresolved disposition.
> Presence is not acceptance. Fill applicable fields; reasoned N/A only when inapplicable.

| Field | Value |
|---|---|
| Record identity | `KR-OOP-0002` (locally allocated under `knowledge/records/`) |
| Publication intent | Publish the verified runtime and environment constraints that bound the mini-LMS design, so a later task does not re-derive them or assume the opposite |
| Kind | technical-reference decision |
| Statement | Four facts, each verified by a command or a run. **(a)** The declared three-week course (encapsulation; inheritance and composition; polymorphism and abstractions) runs in Pyodide using **only the standard library** — `json`, `abc`, `dataclasses` — so **`micropip` is not required**; all ten probe checks passed. **(b)** The runtime reports **CPython 3.14.2**, so the WASM build is ordinary CPython and no custom interpreter is needed. **(c)** The DSH sandbox **denies named-pipe creation**, so Chromium browsers (Chrome 154, Edge 154) abort with `platform_channel.cc:112 Check failed ... 0x5` and cannot be launched without wider host access. **(d)** The runtime is **DeepSeek Harness**, which exposes no token, timing or cost counters, and is not among the economics helper's provider sources (`codex.rollout`, `claude.code-jsonl`, `antigravity.ide`). |
| Applicability | Project WEBOOP from 2026-10-07 onward; (a) and (b) apply to the declared course scope only — adding exceptions, files, threads or third-party packages would void (a); (c) applies to agents operating inside the DSH sandbox on this machine; (d) applies to every task run in this harness. |
| Grounds and uncertainty | (a) `tools/measure-pyodide/oop_probe.py` executed inside Pyodide on the measurement page, 10 of 10 checks; its imports were inspected statically too. (b) `sys.version` read from inside the runtime. (c) two direct launches plus two harness runs, all failing identically, then succeeding once the owner granted wider access. (d) `tfw_economics.py failure --help` shows the closed provider enum; web research iteration 1 already recorded that DSH is absent from the framework's adapter manifest. **Uncertainty:** (a) covers the three declared weeks only and would need re-testing if the course scope changes; (c) may not hold on another machine or under a different policy. |
| Disposition | accepted |
| Source | `tools/measure-pyodide/oop_probe.py` and the measurement runs recorded in `evidence/EV__…TFS.md` rows E19c, E20, E22 at commit `78231d6`; `journal/20261008-003412__gate_answer__4c81.md` for the access grant; `.tfw/economics/tfw_economics.py` provider enum. |
| Originating task and unit | `OOP_20261007-230107_TFS`, Executor `dsh:session:local:weboop-init-20261007` |
| Producer | Executor, same unit |
| Qualifier | Reviewer subagent (independent context); on (a) it confirmed the probe's import set and the 10/10 result |
| Acceptance authority | Owner `zhassulan`; task-level acceptance recorded at close |
| Completed effect or missing decision | Published. Fact (d) additionally explains why this task's economics contribution is a capture-failure receipt rather than numbers. |
| Relations | Complements `KR-OOP-0001` (the measured load cost). No incoming references yet. |

## Source and decision context

These four facts were the discoveries that changed the task rather than merely describing it. (a) and
(b) remove whole categories of planned work: no packaged interpreter, no dependency pipeline. (c) cost
real effort — it blocked the measurement, was reported honestly as `BLOCKED` rather than filled with a
documentation value, and was resolved only when the owner authorised a wider-access retry. (d) means
this project can never report real token or cost figures for its own work, which any later economics
attempt must state rather than approximate with zeros.

## Relations and current use

Read (c) before promising a browser-based verification step in this sandbox; read (d) before planning
any economics capture. An earlier revision of the executor's receipt recorded
`source_namespace: "codex.rollout"` for a DSH source; that was the producer's avoidable error, not a
framework requirement, and (d) should not be cited as an excuse for it — a hand-written receipt naming
the DSH source validates identically.

## Retry and continuation

An equal retry reuses these facts. A divergent intent — measuring brotli delivery, or testing course
scope beyond the three declared weeks — is a new record, because the applicability scope would no
longer hold.
