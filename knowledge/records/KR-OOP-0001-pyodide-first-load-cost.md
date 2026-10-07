# Knowledge record — KR-OOP-0001: measured first-load cost of Pyodide 314.0.7

> One material claim/decision and its completed or explicitly unresolved disposition.
> Presence is not acceptance. Fill applicable fields; reasoned N/A only when inapplicable.

| Field | Value |
|---|---|
| Record identity | `KR-OOP-0001` (locally allocated under `knowledge/records/`) |
| Publication intent | Publish the measured first-load cost of `pyodide-core` 314.0.7 in Chrome so a later stack decision uses a measured figure instead of a documented one; retain on equal retry |
| Kind | technical-reference decision |
| Statement | On Chrome 154.0.8037.98, a fresh-profile first load of `pyodide-core` 314.0.7 transfers **6 391 410 bytes (6.10 MiB) when the server applies gzip** and **13 542 894 bytes (12.92 MiB) when it does not**. The decoded payload is 13 541 339 bytes (12.91 MiB) in both cases, so gzip reduces the transfer by a factor of **2.12**. Time to runtime ready (`import()` of `pyodide.mjs` plus `loadPyodide()`) is **1.84 s uncompressed** and **2.18–2.34 s compressed**. The runtime reports **CPython 3.14.2**. The published roadmap figure of `6.4 MB` is the compressed download and is **accurate**: 6.10 MiB sits 4.76 % below 6.4 MiB. |
| Applicability | Project WEBOOP, task `OOP_20261007-230107_TFS`, measured 2026-10-07/08 on this machine, Chrome 154.0.8037.98, x64 Windows, a **local** static server so transport loss is minimal. The figure is exact for that environment and is **not** a promise for a student's hardware, network or browser. |
| Grounds and uncertainty | Two runs per delivery mode, each with its own `mkdtemp` Chrome profile so every figure is a first load; bytes summed from CDP `Network.loadingFinished.encodedDataLength` over 8 requests; page-side `performance.now()`. Reproduced independently by the Reviewer, who additionally ran the gzip server and confirmed `Content-Encoding: gzip` on `pyodide.asm.wasm` (9 598 218 → 3 546 122 B) while `python_stdlib.zip` correctly fell through to plain. Third consistent data point: the release archive compresses 15 127 981 → 6 757 104 bytes (2.24×). **Uncertainty:** cold-start variance of a few hundred ms; behaviour under brotli rather than gzip is unmeasured; the effect of a real CDN and a student's network is unmeasured. |
| Disposition | accepted |
| Source | `workspace/2026/OOP_20261007-230107_TFS/evidence/EV__OOP_20261007-230107_TFS.md` rows E19a–E19d and E21, at commit `78231d6`; `tools/measure-pyodide/` at the same epoch; Pyodide releases API and roadmap fetched 2026-10-07. Raw report files were removed at close as working material; the numbers are transcribed in the EV. |
| Originating task and unit | `OOP_20261007-230107_TFS`, handoff step 2, Executor `dsh:session:local:weboop-init-20261007` |
| Producer | Executor, same unit |
| Qualifier | Reviewer subagent (independent context), ruling `APPROVE` in `REVIEW__OOP_20261007-230107_TFS__rev1.md` |
| Acceptance authority | Owner `zhassulan`; task-level acceptance is recorded at close; this record's publication carries no separate owner verdict |
| Completed effect or missing decision | Published for reuse by the product task that chooses the stack. Nothing is owed to make the measurement usable. |
| Relations | **Correction of** the round-1 claim that the roadmap's `6.4 MB` was "roughly twice too low", withdrawn at commit `059877a`. No other record references this identity yet. |

## Source and decision context

The measurement exists because the stack decision for the mini-LMS needs to know what a student's
browser must download before the first line of Python runs. The round-1 attempt produced a correct raw
number and a wrong conclusion: it served through `python -m http.server`, which sets no
`Content-Encoding`, then compared that uncompressed transfer against the roadmap's compressed download
figure and declared the documentation wrong. The give-away was inside the same data — encoded
13 542 472 B exceeded decoded 13 540 917 B, which is framing, not compression. A gzip-serving server was
written and both modes measured, which replaced the false conclusion with the confirmed one above.

## Relations and current use

Read this record before quoting any Pyodide load cost. The number is **conditional on the server's
encoding state**; quoting the 12.92 MiB figure without saying it was served uncompressed produced a
wrong published conclusion once already. Current use: no incoming references yet. The companion facts —
`micropip` not required for the declared course scope, and CPython 3.14.2 confirmed at runtime — are
recorded in `KR-OOP-0002`.

## Retry and continuation

An equal retry reuses this measurement: re-run `tools/measure-pyodide/README.md` steps, and expect
6.10 MiB compressed and roughly 2 s to ready on comparable hardware. A divergent intent — for example
measuring brotli, a remote CDN, or a different browser — is a new record, because the applicability
scope above would no longer hold.
