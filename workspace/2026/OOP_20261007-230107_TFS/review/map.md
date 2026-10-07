# Map — "What must be true?"

> **Mindset:** Experienced newcomer. Understand the accepted result before judging it.
> **Test:** "Can I name the material claims, harms, boundaries, evidence identities and limits?"
> RF: [RF__OOP_20261007-230107_TFS.md](../RF__OOP_20261007-230107_TFS.md)
> TS: [TS__OOP_20261007-230107_TFS.md](../TS__OOP_20261007-230107_TFS.md)
> Reviewer unit: `dsh:subagent:tfw-reviewer` (parent `session-db30ca8f-2d3d-4335-8b7b-887dfc905bf5`); WORK=REVIEW

## Understanding

The accepted result is a verification round of the TFW Full setup: each frozen DoD item and each
approved TS acceptance criterion is claimed verified by a command or recorded action in
`evidence/EV__OOP_20261007-230107_TFS.md`, plus a browser measurement of `pyodide-core` 314.0.7
first-load cost (bytes, requests, load/init times, CPython version) and an OOP probe that settles the
`micropip` question. The approved accounting contract declares **zero VALUE files**: the harness is
`ASSURANCE`, ONB/RF/EV are `TRACE`, and no product code may enter the project. Baseline
`3f5eff6f5e87f4afcc401f29aab8c5b4dfd83426`, TS approved at `5c155965b51e2518c7b0460a7fc2cfb8633a1c56`.

## Accepted Claims and Boundaries

| ID | Layer | Accepted claim / authority boundary | Risk or concrete harm | Affected behavior / dependencies | Relevant environment | Oracle / authority | Evidence identity (`subject@revision`, source) | Required? |
|---|---|---|---|---|---|---|---|---|
| C1 | ASSURANCE | First load of `pyodide-core` 314.0.7 transferred 12.92 MiB (13 542 472 B) over 8 requests; load 1866/1824 ms, init 11 ms; CPython 3.14.2; Chrome 154.0.8037.98 | The number the stack decision rests on is wrong or mislabelled | `tools/measure-pyodide/{index.html,measure.mjs}`, `vendor/` | Chrome `--headless=new`, fresh temp profile per run, local static server | `measurement-report.json` raw runs vs RF §1/§4 and EV E19 | `measurement-report.json@uncommitted (git-ignored)`, RF §1 | yes |
| C2 | ASSURANCE | Calibration: the documented `6.4 MB` was "roughly twice" too low; compression "saves only about 1.5 KiB" | A false 2× documentation error drives a product decision and a published Fact Candidate | AC-10 bullets 3–4; HL §9 R9; RF §8 S3 | same run set; `python -m http.server` | TS AC-10; Pyodide roadmap/download page; `encodedDataLength` vs `dataLength` | EV E19, E21; RF §1, §2.3 | yes |
| C3 | ASSURANCE | "Initialization time" is 11 ms on a named browser (AC-10 bullet 2) | Startup cost is reported as ~1.9 s total with negligible init, while runtime init is inside `loadMs` | `index.html` step 1/step 2 split | same | TS AC-10 bullet 2, TS §6 | EV E19; RF §1 | yes |
| C4 | ASSURANCE | `micropip` is not needed; the OOP probe passed 10/10 on the standard library | Wrong course-runtime assumption | `oop_probe.py`, `index.html` | Pyodide runtime in Chrome | probe output in `measurement-report.json` | EV E20 | yes |
| C5 | ASSURANCE | Every DoD item 1–12 and every AC has an EV row with a closed-set verdict; 19/19 VERIFIED, 0 DEFERRED, 0 BLOCKED, 0 N/A | Frozen DoD claims are certified without any evidence | AC-13; HL §5 DoD 11 (adapter re-install idempotency), DoD 12 (research complete, H1–H5 statuses) | repository | TS AC-13; EV row set; `research/iterations.yaml` | EV rows E1–E21 + E-accounting; RF §5 | yes |
| C6 | TRACE | The wider-sandbox retry that produced E19–E21 was authorized by the owner | Headline evidence rests on an access change with only the producer's assertion behind it | `journal/` gate_answer chain; `activation: owner-only`; `dialogue: tfw-gates-only` | DSH sandbox denied named pipes | ONB/journal `gate_answer` contract; TS §6 (record BLOCKED) | `journal/20261007-233342__gate_answer__fa4b.md`; RF §2.4, §7 #7 | yes |
| C7 | TRACE | Accepted-result identity: Candidate is "the commit carrying this RF, recorded in the transition event"; zero-VALUE denominator replayable by the approved NUL-safe commands | A consumer cannot reproduce the measured revision or the accounting | TS §4 Candidate rule; accounting commands with an empty selector | git | TS §4; `journal/20261007-233952__transition__4f51.md`; `git diff` replay | `cfc1d26`, `f83053d`, `b7a3f1d` | yes |
| C8 | TRACE | `.tfw/` byte-identical to the freeze baseline; HL/TS not modified by the Executor | Framework core silently changed | AC-11 | git | `git diff --stat 3f5eff6 -- .tfw`; E15 | EV E15 | yes |
| C9 | TRACE | Harness confined to `tools/measure-pyodide/`; no stack/product code created; no framework refs broken | Measurement stand becomes the product or breaks the adapter | AC-6, AC-9; HL DoF 8; HL §7.7 | git, repo tree | `git status/diff`; 11 SKILL routes | EV E7, E13 | yes |
| C10 | ASSURANCE | `npm run lint` / `npm run build && npm test` are real (not placeholder) commands; AC-7 checked | AC-7 marked `[x]` while the commands were never executed | `.tfw/project_config.yaml` `build`; HL §8/R4 | this shell; `npm` not resolvable by name | TS AC-7 bullets; E9/E14; RF §4 | EV E9, E14 | yes |
| C11 | TRACE | Economics receipt is a valid typed capture-failure receipt and not a disguised numeric claim | A false source attribution or an implied zero-usage claim enters an immutable record | `economics/roles/executor__capture-failure.jsonl` | DSH (no counters) | `.tfw/economics/README.md`; `record.schema.json`; `tfw_economics.py validate` | SHA-256 `d131607d…d1ac` | yes |
| C12 | TRACE | Task spine, journal events, EV/ONB structure and citation integrity | Lifecycle/trace cannot be read or continued | `status.md` (9 fields), `journal/` (5 events), HL §7.2 / ONB §7 citations | repository | conventions `Task control files`, `Task Statuses`; journal/status templates | `status.md@HEAD`; 5 events | yes |
| C13 | TRACE | Working material stays out of the shared tree | 20.8 MiB foreign payload + generated log live in the shared checkout | `tools/measure-pyodide/vendor/`, `measurement-report.json` | project tree | conventions §12 `Working material`, §14 anti-patterns; RF §5 | RF §5 resource table | selected |

## TS ↔ RF Alignment

| TS requirement | RF claim | Claim IDs | Aligned? |
|---|---|---|---|
| AC-1…AC-6, AC-8, AC-9, AC-11, AC-12 | RF §3 `[x]` with E2–E10, E13, E15, E16 | C8, C9, C12 | ✅ (independently re-checked) |
| AC-7 real commands, not placeholders | RF §3 `[x]`; §4 lint/tests "not run" | C10 | ✅ with a recorded limitation — the criterion is realness, not execution |
| AC-10 bytes recorded | RF §1, EV E19 | C1 | ✅ |
| AC-10 init time in seconds recorded | RF §1 "11 ms init" | C3 | ❌ — the figure is a post-startup `import sys`, not initialization |
| AC-10 both numbers compared with `6.4 MB` / `4–5 с` | RF §1, EV E21 compares bytes only | C2 | ❌ — no time comparison anywhere in RF/EV |
| AC-10 compression state named | EV E19 "compression saves ~1.5 KiB" | C2 | ❌ — inverted; the transfer was uncompressed |
| AC-6 / DoF 5 `micropip` settled by running | RF §3, EV E20 | C4 | ✅ |
| AC-13 EV row per DoD item 1–12 and per AC | RF §5 "19/19 VERIFIED" | C5 | ❌ — no DoD rows; DoD 11/12 uncovered |
| TS §4 zero-VALUE denominator / membership deviations | RF §1 accounting table | C7 | ✅ substantively; ⚠️ reproduction command degenerates |
| TS §6 record BLOCKED if the browser is unavailable | RF §2.4 owner-authorized retry | C6 | ⚠️ deviation, authorization unrecorded |
| Executor Role Lock: HL/TS/EV/RF only, `.tfw/` untouched | RF §3 "Baseline obligations preserved" | C8 | ✅ |

## Verification Selection

| Claim IDs | Planned check or reusable evidence | Why this depth | Known gap or limit |
|---|---|---|---|
| C1 | Open `measurement-report.json`; compare every headline number, request count, version, per-check probe result | It is the sole raw source for the task's decisive number | Live re-run impossible for me: Chrome cannot start in this sandbox (reproduced `OpenProcess … 0x5`) |
| C2 | Recompute MiB/ratio; compare `encodedDataLength` with `dataLength`; reconstruct decoded bytes from on-disk file sizes; check the release archive's own compression ratio; read the Pyodide roadmap/download pages | The calibration is the RF's stated reason for the measurement existing | Roadmap/download page as published *on 2026-10-07* is not reachable; current pages fetched |
| C3 | Read `index.html` step 1/step 2 and `measure.mjs`; compare with AC-10 bullet 2 and TS §6 | The decomposition carries a product-visible claim | No independent init figure exists; only the definition can be judged |
| C4 | Read `oop_probe.py` imports; read probe results and `micropipNeeded` in the report | Settles a course-runtime assumption | None material |
| C5 | Count EV rows; map them against HL §5 DoD 1–12 and AC-13; read `research/iterations.yaml`, HL §10 | Mandatory acceptance/authority floor: the evidence set's coverage | DoD 11 idempotency cannot be executed without mutating the adapter install — a recorded reason is what is missing |
| C6 | Read all 5 journal events; order them against commit times (`cfc1d26` 23:38, `b7a3f1d` 23:49, `gate_answer` 23:33) | Authority floor: the headline evidence's provenance | The owner's actual decision is not observable from the repository at all |
| C7 | `git log`, `git diff --name-status/-numstat 3f5eff6 HEAD`, replay the approved NUL-safe command literally, per-commit stats | Accepted-result identity; accounting replay | Candidate differs by rule (cfc1d26) vs RF text ("commit carrying this RF") |
| C8 | `git diff --stat 3f5eff6 -- .tfw`; `git config --get http.sslBackend` | Mandatory boundary | None |
| C9 | Full Baseline→Candidate diff; inspect the probe for product entry points; resolve all 11 SKILL workflow citations; count AGENTS markers | Value-boundary defence (no stack/product creep) | Classification of the probe as non-product is the owner-approved TS ruling; judged, not re-ruled |
| C10 | Read config `build`, template placeholder, E9/E14, RF §4 | Decide the flagged `[x]`-vs-not-run inconsistency | `npm` unresolvable here, so executability is not demonstrable |
| C11 | `tfw_economics.py validate`; read the schema and provider enum; test whether a truthful namespace validates | TRACE truthfulness; distinguishes helper-CLI limits from format limits | Only one receipt exists per role; reconciliation is the Coordinator's act |
| C12 | Validate `status.md` against the status template key set; validate the 5 events against the journal template's closed kind set and ref rules; resolve HL §7.2 / ONB §7 citations | Authority/continuation floor | Owner-name and HL-currency check is static |
| C13 | Disk inspection; conventions `Working material` / anti-patterns | Trace cleanliness | Retention is partly disclosed by RF §5 |

## Deviations from TS

1. **Extra ASSURANCE file.** `tools/measure-pyodide/fetch_core.py` is in the Candidate diff but is not
   in the approved TS §4 affected-file table (which lists 4 harness files); the
   `gate_answer` states "The approved TS file set … remains unchanged". Inside the approved directory
   and class, so no VALUE membership deviation.
2. **Execution route beyond the TS prescription.** TS §6 says an unavailable browser is recorded
   `BLOCKED`; the Executor instead retried under wider sandbox access after the block. The RF asserts
   owner authorization; no journal `gate_answer` records it.
3. **Files changed but undisclosed.** `team/zhassulan.md` (name completed) and the ONB are in the
   Baseline→Candidate diff but absent from RF §1's New/Modified tables.
4. **Working material retained in the project tree** (`vendor/`, `measurement-report.json`) although
   ONB §2 promised removal before return.
5. **No deviations found** in: VALUE membership (no product code), `.tfw/` freeze parity, HL
   immutability, adapter command resolution, config/owner/North-Star/knowledge/AGENTS claims.

## Checkpoint

**Self-check:**
- [x] Read RF §§1–5, governing TS AC/DoF, HL purpose/principles, ONB and referenced predecessors?
- [x] Mapped every material accepted claim and the mandatory safety/security, authority and result-identity boundaries?
- [x] Bound each claim to affected behavior/dependencies, environment, oracle/authority and exact evidence identity?
- [x] Recorded a replayable verification selection and every known gap or limit?
- [x] Avoided classifying by filename, discrepancy count or artifact volume?

Stage complete: YES

*Reviewed as another role's work. No artifact outside `review/`, REVIEW and this Reviewer's own
economics receipt was modified.*
