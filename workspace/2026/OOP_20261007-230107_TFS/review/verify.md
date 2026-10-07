# Verify — "Do the material claims hold?"

> **Mindset:** Auditor. RF is a declaration, not a fact. Open files, run necessary checks, compare
> accepted claims with reality, and state the limits.
> **Test:** "Would the evidence establish this claim for this subject, revision and environment without RF?"
> Map: [map.md](map.md)

## Selection Argument

| Claim IDs | Risk / criticality | Affected behavior / dependencies | Environment | Oracle / authority | Evidence gap / limit | Selected verification and why |
|---|---|---|---|---|---|---|
| C1 | High — the task's decisive number | harness + `vendor/` payload | Chrome 154 headless, fresh profile, local static server | raw `measurement-report.json` vs RF/EV text | live re-run impossible for this Reviewer (Chrome `0x5`) | Field-by-field comparison of every headline number |
| C2 | High — drives the stack decision and a published fact | AC-10 bullets 3–4; HL §9 R9 | same | `encodedDataLength` vs `dataLength`; on-disk file sizes; release archive | page state on 2026-10-07 unreachable | Recompute every ratio and re-derive the compression statement |
| C3 | Medium — product-visible startup claim | `index.html` timing split | same | AC-10 bullet 2; TS §6 | none independent | Read the measured code paths |
| C4 | Medium | course runtime assumption | Pyodide in Chrome | probe output | none | Read probe imports and the 10 recorded checks |
| C5 | High — mandatory acceptance floor | AC-13; HL §5 DoD 11–12 | repository | EV row set; `iterations.yaml`; HL §10 | DoD 11 needs a mutation to execute | Row count and DoD/AC coverage mapping |
| C6 | High — authority floor | evidence provenance | journal vs commit clock | journal/ONB `gate_answer` contract | owner's decision not observable from the repo | Event/commit ordering |
| C7 | High — accepted-result identity | accounting + Candidate | git | TS §4 Candidate rule; literal NUL-safe replay | Candidate rule vs RF text conflict | Full diff, per-commit stats, literal replay |
| C8 | Mandatory | framework core | git | AC-11/E15 | none | Empty-diff check + config read |
| C9 | Mandatory (safety/security = no product creep) | value boundary | git + repo tree | HL DoF 8; TS AC-6/AC-9 | probe classification is an owner-approved ruling | Full diff inspection + 11 route resolutions |
| C10 | Medium | AC-7 disposition | this shell | TS AC-7 bullets | `npm` unresolvable | Read config, E9/E14, RF §4 |
| C11 | Medium | economics trace | DSH, no counters | `.tfw/economics` schema + validator | none | Validate the file; test a truthful namespace |
| C12 | Mandatory (authority + continuation) | spine/events/citations | repository | templates + conventions | none | Key-set, kind-set and citation resolution checks |
| C13 | Low | shared tree cleanliness | disk | conventions §12/§14 | retention partly disclosed | Disk listing vs conventions |

Safety/security (no product code or stack decision may enter under a measurement stand), human
acceptance authority (`owner: zhassulan`, owner-only activation) and accepted-result identity
(Baseline/Candidate, revision of the measured harness) were all verified as mandatory floors.

## Verification Log

### V1: C1 — headline measurement numbers
- **Accepted claim / authority:** RF §1/§4 and EV E19: 12.92 MiB (13 542 472 B) over 8 requests,
  load 1866 / 1824 ms, init 11 ms, CPython 3.14.2, Chrome 154.0.8037.98.
- **Subject tuple:** harness `index.html` + `measure.mjs` + `vendor/pyodide-core` 314.0.7; run report
  `measurement-report.json` (git-ignored, working tree); Chrome `--headless=new`; oracle = raw run file.
- **Action or evidence:** opened `tools/measure-pyodide/measurement-report.json` and compared every
  field; re-derived MiB from bytes; inspected the request set.
- **Observed:** run 1 and 2 both `transferredBytes` 13 542 472, `decodedBytes` 13 540 917,
  `requestCount` 8, `pythonVersion` 3.14.2, `browser` Chrome/154.0.8037.98, `probeOk` true, 10/10
  checks `ok`, `micropipNeeded` false; `loadMs` 1866 and 1824; `initMs` 11 and 11.
  13 542 472 B = 12.9159 MiB. The seven fetched payload files on disk
  (`index.html` 3 491, `oop_probe.py` 5 884, `pyodide.mjs` 17 931, `pyodide.asm.mjs` 1 250 344,
  `pyodide.asm.wasm` 9 598 218, `python_stdlib.zip` 2 545 637, `pyodide-lock.json` 119 077) sum to
  13 540 582 of the 13 540 917 decoded bytes; the 335-byte remainder is consistent with the
  `favicon.ico` 404 body counted as the 8th request.
- **Limit:** the Reviewer cannot re-run the harness: Chrome aborts identically in this sandbox
  (`crashpad_client_win.cc:421 OpenProcess: Отказано в доступе. (0x5)`), reproduced 2026-10-07.
- **Result:** HOLDS

### V2: C2 — compression state and the calibration
- **Accepted claim / authority:** RF §1/§2.3 and EV E19/E21: "compression saves only about 1.5 KiB";
  the documented `6.4 MB` was "roughly twice" too low.
- **Subject tuple:** same run report; oracle = CDP field semantics + on-disk sizes + the release's own
  compressed archive; Pyodide roadmap page (fetched).
- **Action or evidence:** compared `encodedDataLength` (13 542 472) with the `dataLength` sum
  (13 540 917); reconstructed the decoded total from on-disk file sizes; measured
  `vendor/pyodide-core-314.0.7.tar.bz2` (6 757 104 B) against the 13 unpacked files (15 127 981 B);
  fetched the roadmap and download pages.
- **Observed:** the encoded total is **1 555 bytes larger** than the decoded total, not smaller; the
  decoded total equals the sum of the raw on-disk file sizes; therefore **no `Content-Encoding` was
  applied** — `python -m http.server` sets none — and the 1 555 bytes are response-header overhead.
  The same 13 files compress to 6 757 104 B in the release's own `.tar.bz2` (2.24× smaller), so the
  payload is not "already compressed". 12.92 MiB / 6.44 MiB = 2.01. The fetched roadmap page says
  "a first load of Pyodide requires a 6.4 MB download, and the environment initialization takes 4 to
  5 seconds" — a *download* figure, i.e. the same quantity as the measured transfer, so the honest
  comparison basis is compressed-vs-uncompressed delivery, not archive-vs-page-load per se.
- **Limit:** the roadmap page as published on 2026-10-07 is not archived here; the current stable page
  (Version 314.0.7) is what was fetched.
- **Result:** FINDING (F1)

### V3: C3 — what `initMs` measures
- **Accepted claim / authority:** RF §1 "1866 ms load + 11 ms init"; AC-10 bullet 2 "initialization
  time in seconds recorded".
- **Subject tuple:** `index.html` lines 57–68; `measure.mjs` 136–186.
- **Action or evidence:** read both code paths.
- **Observed:** `loadMs` = `performance.now()` from before `await import('./vendor/.../pyodide.mjs')`
  until after `await loadPyodide({indexURL})` resolves — i.e. download + compile + runtime
  initialization. `initMs` is then timed around `await pyodide.runPythonAsync('import sys')`, a
  post-startup interpreter call. The in-file comment ("Step 2: measure initialization separately, so
  the two costs are not conflated") is not what the code does.
- **Limit:** no independent split of download vs init exists in the report.
- **Result:** FINDING (F2)

### V4: C4 — probe and `micropip`
- **Accepted claim / authority:** EV E20; RF §1.
- **Action or evidence:** read `oop_probe.py` imports (`json`, `abc`, `dataclasses`) and the recorded
  checks.
- **Observed:** 10/10 checks `ok` in both runs; `micropipNeeded` false; no third-party import.
- **Limit:** the probe demonstrates the three declared week topics only; it is not a proof for every
  future exercise.
- **Result:** HOLDS

### V5: C5 — DoD/AC evidence coverage
- **Accepted claim / authority:** AC-13 ("`EV` has a row for each DoD item 1–12 and for each AC");
  RF §5 and EV §Verdict ("19/19 VERIFIED, 0 DEFERRED, 0 BLOCKED, 0 N/A"; "DoD 1–8 and 10–12 are
  covered by E2–E10 and E15–E17").
- **Action or evidence:** enumerated EV rows and mapped them to HL §5 DoD 1–12 and TS AC-1–13.
- **Observed:** all 13 ACs have rows. **No row is keyed to a DoD item.** DoD 9 (lifecycle to RF) is
  satisfied by the `transition` event but has no row; **DoD 11 (re-installing the adapter yields no new
  diff) has no row and no check anywhere**; **DoD 12 (both research iterations complete, H1–H5 with
  explicit statuses) has no row** — it is statically checkable and `research/iterations.yaml` plus HL
  §10 do satisfy it, but nothing in EV says so. The row set is 23 table rows / 22 distinct IDs
  (E1–E21 plus `E-accounting`, which appears twice verbatim).
- **Limit:** DoD 11 cannot be executed here without mutating `.agents/skills/` and `AGENTS.md`; an
  explicit `N/A`/`DEFERRED` row with a reason is what is missing.
- **Result:** FINDING (F3)

### V6: C6 — authorization of the wider-sandbox retry
- **Accepted claim / authority:** RF §2.4 ("The retry was authorised rather than assumed"), RF §7 #7,
  EV header, `gate_answer` template rules, `activation: owner-only`, `dialogue: tfw-gates-only`.
- **Action or evidence:** read all five journal events and ordered them against the commit clock
  (`git log`): `gate_answer` 23:33:42 (CDP route, before any block); block recorded in `cfc1d26`
  23:38:42; `transition` to RF 23:39:52 still reporting "three BLOCKED"; retry landed `b7a3f1d`
  23:49:03.
- **Observed:** no event records an owner decision to grant wider sandbox access. The last authority
  event predates the block by five minutes, and TS §6 prescribed recording `BLOCKED` with the reason.
  The only support for the authorization claim is the RF's own prose and a Fact Candidate sourced to
  "Owner, решение 2026-10-07" with no event reference.
- **Limit:** the owner's actual decision is not observable from the repository by any means.
- **Result:** FINDING (F4)

### V7: C7 — accounting replay and Candidate identity
- **Accepted claim / authority:** TS §4 (zero VALUE files; Candidate = first tested Executor commit
  with required ASSURANCE outputs before EV/RF) and RF §1 ("Candidate … the commit carrying this RF,
  recorded in the transition event").
- **Action or evidence:** `git log`, `git show --stat` per commit,
  `git diff --name-status/-numstat 3f5eff6 HEAD`, literal replay of the approved command.
- **Observed:** the transfer event records Candidate `cfc1d26` ("add measurement harness and record
  verified evidence") — which does **not** carry the RF; the RF arrived in `f83053d`, and the evidence
  that closes AC-10 arrived in `b7a3f1d`. The literal empty-selector command
  `git diff --name-status --find-renames=50% -z 3f5eff6 HEAD -- $valuePaths` with `$valuePaths` empty
  degenerates to "no pathspec": it returns **all 16 changed paths**, not an empty set. The substantive
  conclusion nevertheless holds: the 16 paths contain no application source, no build/framework
  config, no `package.json` and no product entry point.
- **Limit:** `measurement-report.json` is git-ignored, so the raw numbers behind E19–E21 are not in
  the immutable trace at all (RF §5 discloses local retention).
- **Result:** FINDING (F6) for the replay method; the zero-VALUE membership itself HOLDS (V8)

### V8: C9 — value-boundary defence (no product code, no stack choice)
- **Accepted claim / authority:** TS §4 prospective ruling (harness = ASSURANCE); HL DoF 8, §7.7.
- **Action or evidence:** full Baseline→Candidate diff; read all five harness files; resolved 11
  `SKILL.md` workflow citations; counted AGENTS markers (2) and command rows (11).
- **Observed:** adds are `tools/measure-pyodide/*` (5 files) + task artifacts; `.gitignore` gained the
  vendor/report exclusions; no framework, bundler, test runner or application source exists. The probe
  contains week-labelled OOP examples in Russian — the closest thing to course content in the diff —
  but the TS §4 table pre-declares exactly that file as `ASSURANCE`, it is wired into no product entry
  point, and no dependency was added. Classification was not used to smuggle value past the
  denominator.
- **Limit:** the classification itself is an owner-approved TS ruling; the Reviewer judged it rather
  than re-ruling it.
- **Result:** HOLDS

### V9: C8 — framework freeze parity
- **Action or evidence:** `git diff --stat 3f5eff6 -- .tfw`; `git config --get http.sslBackend`.
- **Observed:** empty diff; `openssl`. HL is untouched in the range.
- **Result:** HOLDS (matches E15)

### V10: C10 — AC-7 / `npm`
- **Accepted claim / authority:** TS AC-7 bullets ("neither value contains the placeholder"; "the
  declared intent is recorded in EV, including that they are not yet executable").
- **Action or evidence:** read `.tfw/project_config.yaml` `build`, EV E9/E14, RF §3/§4.
- **Observed:** `lint: npm run lint`, `test: npm run build && npm test`; no placeholder text;
  `Get-Command npm` fails while `npm.cmd` answers 11.6.1 (E14); RF §4 states both commands were **not
  run** and does not claim they pass.
- **Result:** HOLDS as to AC-7. Marking `[x]` is **not** a material inconsistency: the approved
  criterion is realness plus a recorded non-executability reason, and that reason is recorded in three
  places. The HL-wider tension (DoD 1 "real commands", §7.4 "must execute" vs §8/R4 "not executable
  until the stack is chosen") is a pre-existing contract tension resolved by the owner-approved TS.

### V11: C11 — economics receipt
- **Accepted claim / authority:** `.tfw/economics/README.md` ("An unsuccessful collection returns a
  failure receipt with the attempted source and precise cause"; failure-only files contain no usage).
- **Action or evidence:** `python .tfw/economics/tfw_economics.py validate
  workspace/…/economics/roles/executor__capture-failure.jsonl`; read `record.schema.json` `$defs.id`
  (`^[A-Za-z0-9][A-Za-z0-9_.:/-]*$`) and the helper's provider enum; generated a reviewer receipt and
  re-validated it after replacing `source_namespace` with a truthful value.
- **Observed:** exit 0, `rows: 1`, SHA-256 `d131607d5fcfecf53349e5f03f92526fbfc269424175b47362ba15c5ce93d1ac`
  (matches RF §5). `complete: false`, `operation_seconds: null` with an explicit `unavailable` reason,
  no usage row — so it proves no measurement and claims no zero usage. It is a valid typed
  capture-failure receipt, not a disguised numeric claim. `source_namespace: "codex.rollout"` is false
  for a DSH source, but the truthful source survives in `source_label` and `detail`. **A hand-written
  receipt with `source_namespace: "dsh.session"` validates identically (exit 0, rows 1)**, so the false
  namespace was avoidable and is not imposed by the format.
- **Result:** FINDING (F8) — non-material TRACE

### V12: C12 — spine, events, structure, citations
- **Action or evidence:** `status.md` vs `.tfw/templates/status.md`; each journal event vs
  `.tfw/templates/journal/event.md`; HL §7.2 (8 rows) and ONB §7 (8 + 2 rows) resolution; `git diff` of
  `status.md` and `team/zhassulan.md`.
- **Observed:** all nine routing/selection fields present with valid shapes; `lifecycle: RF` matches the
  last event; only `lifecycle`, `coordination_authority` (Coordinator re-freeze binding `d5671d7`) and
  `updated` changed in the range. Event kinds (`created`, `transition`, `handoff`, `gate_answer`) are
  in the closed set; `gate_answer` omits `from`/`to` and cites status + ONB + TS; both `transition`
  events carry a permitted pair; all refs resolve inside the task directory. All HL §7.2 citations
  resolve with matching meaning (`README.md` P0 sections, `.tfw/README.md` `Methodology values`/
  `Success Criteria` P1, `KNOWLEDGE.md` §1 P3, `.tfw/conventions.md` P4, both RES files P5); P2/P5–P7
  registers (`knowledge/philosophy.md`, `knowledge/convention.md`, `knowledge/process.md`) do not exist
  in this project, so those priorities are N/A with that reason. **`team/zhassulan.md` now carries the
  full name `Kuandykov Zhasulan`, while HL §2 and HL §9 R1 still state the name is incomplete** — a
  stale free-section claim created by an undisclosed change in the accounting range.
- **Limit:** no immutable source for the owner's identity beyond the profile itself.
- **Result:** FINDING (F10) — non-material TRACE; otherwise HOLDS

### V13: C13 — working material placement
- **Action or evidence:** disk listing of `tools/measure-pyodide/`; conventions §12 `Working material`
  and §14 anti-patterns; ONB §2.
- **Observed:** `vendor/` (6 757 104 B archive + 15 127 981 B unpacked = 20.8 MiB) and
  `measurement-report.json` (4 059 B) live under the project tree, git-ignored. RF §5 names both and
  the reason, but ONB §2 promised the measurement's working material would be removed before return,
  and conventions §14 lists "working material is stored in the shared tree" as a prohibited
  anti-pattern.
- **Result:** FINDING (F9) — non-material TRACE

### V14: C2/C5 auxiliary — external source claim (E18)
- **Accepted claim / authority:** EV E18 "the documentation's stated extension is wrong";
  RF §7 Fact Candidate 3 "Страница документации Pyodide описывает `pyodide-core` как `.tar.gz`";
  `fetch_core.py` lines 22–24; `tools/measure-pyodide/README.md` line 12.
- **Action or evidence:** fetched `https://pyodide.org/en/stable/usage/downloading-and-deploying.html`,
  its `_sources` markdown, and the 0.19.1 page.
- **Observed:** the stable (314.0.7) page and its source markdown both name
  `pyodide-core-{{VERSION}}.tar.bz2` / `pyodide-{{VERSION}}.tar.bz2`; the 0.19.1 page names
  `pyodide-build-*.tar.bz2`. No reachable version states `.tar.gz`. The 404 for a `.tar.gz` URL proves
  only that no such asset exists, not that any page claimed it.
- **Limit:** the pages as published on 2026-10-07 are not reachable/archived from here; documentation
  sites are redeployed. The claim is therefore **unverified and contradicted by the reachable primary
  source**, not proven false for all time.
- **Result:** FINDING (F5)

## Commands Executed

| # | Command | Claim IDs | Result |
|---|---|---|---|
| 1 | `git log --format="%h %H %ad %s" --date=iso` / `git status --porcelain` / `git branch -a` | C7 | clean tree; 20 commits on `main`; last `b7a3f1d` 23:49:03 |
| 2 | `git show --stat <3f4b754,cfc1d26,f83053d,b7a3f1d>` | C7 | Candidate-relevant commit contents; RF added in `f83053d` |
| 3 | `git diff --name-status --find-renames=50% 3f5eff6 HEAD` + `--numstat` | C7, C9 | 16 paths; no product source, no build config, no `package.json` |
| 4 | `git diff --name-status --find-renames=50% -z 3f5eff6 HEAD -- $valuePaths` (`$valuePaths` empty) | C7 | degenerates to the full 16-path diff — the literal approved replay does not return empty |
| 5 | `git diff --stat 3f5eff6 -- .tfw` ; `git config --get http.sslBackend` | C8 | empty; `openssl` |
| 6 | `git diff 3f5eff6 HEAD -- status.md team/zhassulan.md` | C12 | only lifecycle/epoch/updated changed in status; owner `name` completed |
| 7 | Read `tools/measure-pyodide/measurement-report.json` and re-derived MiB / byte sums | C1, C2 | every headline number matches; encoded > decoded by 1 555 B |
| 8 | Summed `tools/measure-pyodide/vendor/pyodide-core/*` (13 files) and the archive size | C2 | 15 127 981 B unpacked vs 6 757 104 B archive (2.24×) — matches E12 exactly |
| 9 | Read `index.html`, `measure.mjs`, `fetch_core.py`, `oop_probe.py`, `README.md` | C1–C4, C9 | timing/definition and label defects found |
| 10 | Resolved every `.tfw/workflows/*.md` cited by the 11 `.agents/skills/tfw-*/SKILL.md` | C9 | 11/11 resolve; 0 missing |
| 11 | `Select-String` over `AGENTS.md`, `README.md`, `KNOWLEDGE.md`, `.tfw/README.md`, `status.md`, `journal/*` | C5, C12 | headings, 2 TFW markers, 11 command rows, 5 valid events |
| 12 | `python .tfw/economics/tfw_economics.py validate <receipt>` (executor and reviewer) | C11 | exit 0 / rows 1; SHA-256 `d131607d…d1ac` matches RF §5 |
| 13 | Fetched the Pyodide roadmap, download/deploy page, `_sources` markdown, 0.19.1 page | C2, C5 | roadmap 6.4 MB **download** + 4–5 s init; pages say `.tar.bz2` |
| 14 | Launched Chrome (`--headless=new --dump-dom about:blank`) in this sandbox | C1 | aborts: `crashpad … OpenProcess: Отказано в доступе. (0x5)` — re-measurement impossible here |

## Claim and Source Checks

| # | Claim / citation | Where | Primary artifact / source | Holds? |
|---|---|---|---|---|
| C1 | 12.92 MiB (13 542 472 B) / 8 requests / 1866+1824 ms / 11 ms / CPython 3.14.2 / Chrome 154.0.8037.98 | RF §1, §4; EV E19 | `measurement-report.json` runs 1–2 | ✅ |
| C2 | "compression saves only about 1.5 KiB" | RF §1; EV E19; `measure.mjs` console label | `encodedDataLength` 13 542 472 vs `dataLength` 13 540 917; on-disk file sizes | ❌ inverted; no compression applied |
| C3 | documented `6.4 MB` was "roughly twice" too low | RF §1, §2.3; EV E21; RF §8 S3; RF §9 diagram | roadmap "6.4 MB download"; release `.tar.bz2` 6.44 MiB | ❌ like-for-like comparison fails |
| C4 | measured 1.87 s vs documented "4 to 5 seconds" | absent from RF/EV | roadmap page | ❌ required comparison missing |
| C5 | probe 10/10, `micropip` not needed | EV E20; RF §1 | `measurement-report.json` `probeChecks`, `micropipNeeded` | ✅ |
| C6 | "0 DEFERRED, 0 BLOCKED, 0 N/A"; "19/19 VERIFIED" | EV §Verdict; RF §5 | EV row set | ⚠️ count unreconcilable; DoD 11/12 absent |
| C7 | "the six created and one modified ASSURANCE/TRACE outputs are reported in RF §1" | EV E-accounting | RF §1 tables | ⚠️ ONB and `team/zhassulan.md` omitted |
| C8 | `.tfw/` byte-identical; `http.sslBackend=openssl` | EV E15; RF §3 | git | ✅ |
| C9 | "the documentation's stated extension is wrong" | EV E18; RF §7 #3; `fetch_core.py` 22–24; harness README 12 | pyodide.org stable + 0.19.1 pages | ❌ contradicted by the reachable source |
| C10 | `npm` does not resolve but `npm.cmd` 11.6.1 exists | EV E14; ONB R-A | env | ✅ (consistent with this shell) |
| C11 | economics receipt SHA-256 `d131607d…d1ac`; validated | RF §4, §5 | `tfw_economics.py validate` | ✅ |
| C12 | HL §7.2 and ONB §7 citations | HL §7.2; ONB §7 | `.tfw/*`, `README.md`, `KNOWLEDGE.md`, `research/iter*/RES.md` | ✅ 16 existing with matching meaning; P2/P5–P7 registers absent → N/A |
| C13 | "The retry was authorised rather than assumed" | RF §2.4, §7 #7 | `journal/` — no such event | ❌ unsupported |
| C14 | "The seven-field routing spine and `coordination_authority` were not rewritten" | RF §3 | `status.md` diff | ⚠️ epoch binding changed in-range by the Coordinator's re-freeze commit (legitimate, but the sentence is loose) |

## Guard and Check Admission

| # | Kind | Protected behavior / invariant | Failure consequence | Counterfactual detection | Admission |
|---|---|---|---|---|---|
| G1 | governance assertion | AC-11 `.tfw/` freeze parity | Framework core silently modified | `git diff 3f5eff6 -- .tfw` empty | governance only — no permanent guard; a passing command is evidence only for this range |
| G2 | positive control | The probe's 10 checks exercise real OOP behavior | A probe that cannot fail would prove nothing | All 10 checks report `ok` with observed values; the earlier `SyntaxError` shows the page does fail loudly on a real defect | labelled positive control — admitted as such, not as a product guard |
| G3 | temporary diagnostic | Reconciling `encodedDataLength` with `dataLength` and the on-disk sizes | A mislabelled compression claim survives review | The reconciliation contradicts the EV's compression sentence | labelled diagnostic |
| G4 | rejected | "19/19 VERIFIED" as a quality measure | Counting rows is not assurance | Row count does not establish DoD 11/12 coverage | rejected as a guard; kept as a record observation (F11) |

No permanent guard or test exists in this task (zero VALUE denominator); none was admitted.

## Candidate Findings

| ID | Class | Subject | Affected claim / authority | Observed fact + oracle | Concrete harm | Material consequence or named absence | Owner | Observable completion | Route / rung | Candidate effect | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| F1 | ASSURANCE (VALUE-visible) | AC-10 calibration and compression statement | TS AC-10 bullets 3–4; RF §1, §2.3, §8 S3, §9; EV E19, E21; harness README metrics/limits; `measure.mjs` "(compressed)" label | Encoded total (13 542 472) exceeds decoded (13 540 917) by 1 555 B and decoded equals the raw on-disk file sizes ⇒ no `Content-Encoding` was applied; the same files compress 2.24× in the release `.tar.bz2` ⇒ the payload is not already compressed; the roadmap's `6.4 MB` is a *first-load download* figure, and the required `4–5 s` comparison is absent entirely (grep: zero hits) | The next (stack-decision) task is told the real network cost is 12.92 MiB and that the documentation was 2× low, when under compressed delivery the same payload is ≈6.4 MiB and the measured end-to-end start (1.87 s) is *faster* than the documented 4–5 s; a false "documentation is wrong" conclusion and Fact Candidate 4 enter the trace | The measured bytes/times stand; the calibration and compression verdicts must be restated; AC-10 bullets 3–4 cannot stay `VERIFIED`/`[x]` as written | Executor | RF §1/§8 S3/diagram and EV E19/E21 restated with the server's encoding state named, plus either (a) a re-measurement served with brotli/gzip or (b) an explicit "uncompressed transfer" limit; harness README metric table corrected | REVISE rung 1 — RF/EV/ASSURANCE-doc correction | unchanged (raw numbers unchanged; optional re-measure adds evidence) | open |
| F2 | ASSURANCE | "init 11 ms" is not initialization | TS AC-10 bullet 2; RF §1; EV E19; `index.html` step comment | `loadMs` wraps `import()` + `loadPyodide()`; `initMs` wraps a later `import sys` — oracle: the code itself vs the claim | The product task receives "1.87 s total, 11 ms init" as the startup decomposition, while runtime initialization is inside `loadMs` | AC-10's "initialization time" bullet is not substantively met; the two numbers must be re-labelled or re-measured | Executor | EV E19/RF §1 state "time to runtime ready" and the separate post-startup call cost, or an independent init measurement exists; the misleading comment is corrected | REVISE rung 1 — RF/EV/ASSURANCE-doc correction | unchanged | open |
| F3 | ASSURANCE | DoD 11 and DoD 12 have no evidence row | AC-13 bullet 1; EV §Verdict coverage sentence; RF §5 | EV has AC-keyed rows only; DoD 11 (adapter re-install idempotency) has no check anywhere and DoD 12 (research complete, H1–H5 statuses) has no row although `iterations.yaml` and HL §10 support it | Two frozen DoD claims are certified under a "0 DEFERRED / 0 N/A" verdict with no evidence; if the adapter install is not idempotent, nothing in this task would reveal it | Correctable record + one genuinely missing check; the rest of the evidence set is unaffected | Executor | EV gains a row per uncovered DoD item with a closed-set verdict, or an explicit `N/A`/`DEFERRED` row naming the method that would close it | REVISE rung 1 — EV coverage | unchanged | open |
| F4 | TRACE | Authority provenance of the headline evidence | `activation: owner-only`; `tfw-gates-only`; journal `gate_answer` contract; TS §6; RF §2.4, §7 #7 | No journal event records an owner grant of wider sandbox access; the only `gate_answer` predates the block by 5 min; TS §6 prescribed recording `BLOCKED` | The evidence the whole task rests on was obtained under an access change whose only record is the producer's assertion; a future reader cannot tell whether the escalation was authorized | Material authority/identity item; correctable by one owner-authored event without redoing the measurement | Owner (`zhassulan`) via Coordinator | A task-local `gate_answer` event cites ONB/RF/EV and records the owner's decision, scope and epoch — or the RF records the grant as unrecorded and E19–E21 are re-verdicted | TRACE → exact ruler (owner), rung: authority | unchanged if the grant is confirmed; E19–E21 evidence identity otherwise at risk | open |
| F5 | ASSURANCE | E18 "documentation's stated extension is wrong" | EV E18; RF §7 Fact Candidate 3; `fetch_core.py` 22–24; harness README line 12 | The reachable stable (314.0.7) page and its source markdown, and the 0.19.1 page, all name `.tar.bz2`; no `.tar.gz` claim is findable; a 404 proves only that no such asset exists | A `VERIFIED` evidence row and a High-confidence fact candidate about source reliability would migrate as knowledge while being unsupported; the harness README misstates its own asset | Correctable claim; no effect on the measured bytes | Executor | E18 restated with the exact page/version inspected (or marked unverified with the limit), and Fact Candidate 3 / `fetch_core.py` comment / README line 12 corrected | REVISE rung 1 — EV claim correction | unchanged | open |
| F6 | TRACE | Approved accounting reproduction command with an empty selector | TS §4 command template; RF §1 "Reproduction"; EV E-accounting | The literal NUL-safe replay with `$valuePaths` empty drops the pathspec and returns **all 16 changed paths**, not zero — oracle: executed replay | A consumer replaying the approved method sees 16 files against a claimed "VALUE membership: Empty" and cannot tell which is right | Record/method defect only; the zero-VALUE conclusion is independently verified | Executor | RF §1 / EV E-accounting state that the selector is empty by ruling and that the full 16-path diff was inspected and contains no product code | TRACE — finite current-carrier repair | unchanged | not material |
| F7 | TRACE | RF §1 file inventory incomplete | RF §1 New/Modified tables; EV E13 scope | `git diff 3f5eff6 HEAD` changes 16 paths; RF §1 lists 10 and omits the ONB (Executor-created) and `team/zhassulan.md` (modified in-range) | The artifact that presents itself as the changed-file record cannot be used to reconstruct the change set | Correctable disclosure gap; no acceptance or authority effect | Executor | RF §1 names both omissions on the next RF write | TRACE — finite current-carrier repair | unchanged | not material |
| F8 | TRACE | Economics receipt `source_namespace: "codex.rollout"` for a DSH source | `economics/roles/executor__capture-failure.jsonl`; RF §6 observation 1 | The field is false for the real runtime; the helper's `--provider` choices are the only obstacle — a hand-written receipt with `source_namespace: "dsh.session"` validates identically (exit 0, rows 1) | An immutable economics record attributes this task's failed capture to a Codex rollout; the RF's "must record a namespace that does not describe its real origin" overstates the framework limit and understates its own avoidable defect | Non-material TRACE: the receipt still proves no measurement and no other unit's data is affected | Executor | Revision 2 of the receipt with a truthful namespace, or the Coordinator records the discrepancy in the task record; the residue (helper CLI enum) is a `/tfw-update` observation | TRACE — current carrier / framework observation | unchanged | not material |
| F9 | TRACE | Working material stored in the shared tree | conventions §12 `Working material`, §14 anti-patterns; ONB §2; RF §5 | 20.8 MiB vendor payload + generated report under `tools/measure-pyodide/`, git-ignored | A prohibited anti-pattern holds in the shared checkout; ONB §2 promised removal before return | Non-material; RF §5 names retention and reason, and close step 6 owns removal | Coordinator (close) | Removed at close, or RF §5's retention is recorded as the kept-and-why decision | TRACE — close-time disposition | unchanged | not material |
| F10 | TRACE | HL §2 / §9 R1 stale against the owner profile | HL §2, §9 R1 (free sections); `team/zhassulan.md` | The profile now carries `Kuandykov Zhasulan` while HL still records the incomplete name and lists R1 as an active High risk; the change is undisclosed in RF §1 | A resolved risk is read as live and a stale identity claim sits in the contract | Non-material: free sections, routine Coordinator update; conventions HL Contract rule 2 requires currency | Coordinator | HL §2 and §9 R1 updated in the free sections | TRACE — free-section currency | unchanged | not material |
| F11 | TRACE | "19/19 VERIFIED" | EV §Verdict; RF §5 | EV holds 23 table rows / 22 distinct IDs (E1–E21 + `E-accounting`, duplicated verbatim), and two rows still read `BLOCKED` in their own Result cells | The verdict's own denominator cannot be reconciled with the file it describes | Count alone cannot change the verdict (judge template §Status); record-only | Executor | EV states the actual row set and removes the duplicated `E-accounting` row | TRACE — finite current-carrier repair | unchanged | not material |
| F12 | ASSURANCE | Approved file set vs executed set; `profileIsFresh` assertion | TS §4 file table; `gate_answer` "approved TS file set … remains unchanged"; `measure.mjs` 231 | `fetch_core.py` is a 5th harness file outside the TS §4 table; `profileIsFresh` is passed as a literal `true` rather than derived (the fresh temp profile per run does make the conclusion true) | A reader cannot tell whether the file set changed or how freshness was established | Non-material: same directory, same class, no VALUE membership; the fresh-profile conclusion independently holds from the `mkdtemp` per run | Executor | RF §1 notes the extra file; `profileIsFresh` derived or the claim grounded in the profile path | TRACE/ASSURANCE — observation | unchanged | observation |

## Evidence Verification

`evidence/` holds only EV files (plus `.gitkeep`); no verdict rests on working material.

| # | EV row | Subject tuple | Repeated or opened? | Establishes the claim? | Limit |
|---|---|---|---|---|---|
| E1 | E1 baseline resolvable | `HL @ ce22916 / 3f5eff6`, repo | ✅ | ✅ | none |
| E2 | E2 AC-1 config/version | `.tfw/project_config.yaml`, `VERSION` @ HEAD | ✅ | ✅ (`OOP`, `ru`, `[workspace]`, 3.9.0 = 3.9.0) | none |
| E3 | E3 AC-2 owner profile | `team/zhassulan.md` @ HEAD | ✅ | ✅ (4 required keys; name now complete) | HL §2/R1 stale (F10) |
| E4 | E4 AC-3 North Star | `README.md` @ HEAD | ✅ | ✅ (all cited headings + routes) | none |
| E5 | E5 AC-4 knowledge | `KNOWLEDGE.md` @ HEAD | ✅ | ✅ (4 sections; "No project components…") | none |
| E6 | E6 AC-5 AGENTS block | `AGENTS.md` @ HEAD | ✅ | ✅ (2 markers, 11 rows) | none |
| E7 | E7 AC-6 adapter | `.agents/skills/*/SKILL.md` @ HEAD | ✅ | ✅ (11/11, all cited workflows resolve) | none |
| E8/E11 | E8/E11 BLOCKED rows | pre-retry state | ✅ | ⚠️ superseded by E19/E20; their Result cells still read BLOCKED | F11 |
| E9/E14 | E9/E14 AC-7 | config `build`, `npm` env | ✅ | ✅ for realness; executability explicitly not demonstrated | none material |
| E10 | E10 AC-8 spine | `status.md`, `journal/`, `evidence/` @ HEAD | ✅ | ✅ (9 fields, 4→5 events by review time) | `E10` says 4 events; a 5th arrived later in the same round |
| E12 | E12 static sizes | `vendor/pyodide-core/*` | ✅ | ✅ — 13 files / 15 127 981 B reproduced exactly | none |
| E13 | E13 AC-9 confinement | `tools/measure-pyodide/` | ✅ | ✅ for the harness; the full 16-path diff includes two undisclosed non-harness paths | F7 |
| E15 | E15 AC-11 freeze | `.tfw/` vs `3f5eff6`; `.git/config` | ✅ | ✅ (empty diff, `openssl`) | none |
| E16/E17 | E16/E17 AC-12/AC-13 | project docs; EV/RF | ✅ | ⚠️ AC-13's DoD-row clause unmet | F3 |
| E18 | E18 upstream extension | pyodide.org pages | ✅ | ❌ contradicted by the reachable source | F5 |
| E19/E20/E21 | post-retry measurement rows | harness runs, probe, calibration | ✅ | ✅ for bytes/times/probe/version; ❌ for the compression sentence and the calibration | F1, F2, F4 |
| E-accounting | zero-VALUE row (twice) | selector/diff @ `cfc1d26` | ✅ | ✅ substantively; ⚠️ the literal command cannot express an empty selector | F6, F11 |

## Knowledge Citations Verified

Priority 0 and 1 were checked separately; P0–P4 scanned in full, P5–P7 by relevance.

| # | Artifact | Priority + exact citation | Resolves? | Item exists? | Meaning matches? | Relevant? |
|---|---|---|---|---|---|---|
| 1 | HL §7.2 #1 | P0 `README.md` § Зачем этот проект | ✅ | ✅ | ✅ — product purpose, author's goal explicitly non-product | ✅ — AC-3/Purpose Check |
| 2 | HL §7.2 #2 | P0 `README.md` § Что проект не должен делать | ✅ | ✅ | ✅ — non-goals incl. no admin/cloud, not a set of demos | ✅ — AC-9 / DoF 8 boundary |
| 3 | HL §7.2 #3 | P1 `.tfw/README.md` `Methodology values` | ✅ | ✅ | ✅ — Candor Over Flattery / Structural Enforcement / Portability | ✅ — ONB honesty duty on the `npm` defect |
| 4 | HL §7.2 #4 | P1 `.tfw/README.md` `Success Criteria` | ✅ | ✅ | ✅ — resumption, traceability, readiness for acceptance | ✅ — DoD §5 items |
| 5 | HL §7.2 #5 | P3 `KNOWLEDGE.md` §1 | ✅ | ✅ | ✅ — "No project components have been recorded yet" | ✅ — bootstrap state |
| 6 | HL §7.2 #6 | P4 `.tfw/conventions.md` (`Required Artifacts`, `HL Contract`, `Task Statuses`) | ✅ | ✅ | ✅ | ✅ — nine-field spine, freeze rules |
| 7 | HL §7.2 #7 | P5 `research/iter1/RES.md` | ✅ | ✅ | ✅ — browser/WASM mechanism, H4 refuted | ✅ — AC-6/AC-10 origin |
| 8 | HL §7.2 #8 | P5 `research/iter2/RES.md` | ✅ | ✅ | ✅ — H5 supported, H1 open | ✅ — AC-9 scope |
| 9 | ONB §7 #9 | pyodide.org download/deploy page | ✅ | ✅ | ✅ — `pyodide-core` contents, full distribution 200+ MB | ✅ — harness input choice |
| 10 | ONB §7 #10 | pyodide.org changelog | ✅ (page resolves) | ⚠️ — the 314.0.0 statement was not independently re-verified in this review | not tested | ✅ for the "old roadmap numbers do not transfer" argument |
| 11 | PV P2 / P5–P7 | `knowledge/philosophy.md`, `knowledge/convention.md`, `knowledge/process.md`, other `knowledge/*.md` | ⚪ | ❌ absent in this project | ⚪ N/A | ⚪ — stated reason: no project knowledge register exists yet (`KNOWLEDGE.md` §1) |

## Accounting Replay

| Approval / authority | Baseline | Candidate | Literal VALUE membership / actions / classes / reasons | Adds | Deletes | Touched LOC | Binary | Trigger disposition | Exact NUL-safe command | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| TS `5c155965b51e2518c7b0460a7fc2cfb8633a1c56`, owner zhassulan, 2026-10-07; immutable denominator 0 VALUE files / 0 touched VALUE LOC | `3f5eff6f5e87f4afcc401f29aab8c5b4dfd83426` | `cfc1d26b73c64ae2e160672f7f849a658b6f3855` (TS §4 rule: first tested Executor commit with required ASSURANCE outputs before EV/RF; the RF text names "the commit carrying this RF" instead — see F6 context) | **Empty** by the approved ruling: no path is a VALUE member. 5 `tools/measure-pyodide/*` files + ONB/RF/TS/EV/journal/status/economics/.gitignore/team profile are ASSURANCE or TRACE. No application source, build/framework config, `package.json`, bundler config or product entry point exists in the range | 0 | 0 | 0 over the VALUE selector (metric-only inapplicability for binary: n/a at zero) | N/A | `scope_budgets` 50 files / 5000 LOC not approached (16 changed paths; 1 543 added / 17 deleted text lines across the whole range, none VALUE); no escalation multiplier applicable at zero; no late authority | `git diff --name-status --find-renames=50% -z 3f5eff6 <CANDIDATE> -- $valuePaths` — **replayed literally, an empty `$valuePaths` drops the pathspec and returns all 16 paths** (see F6); the substantive check was therefore the full-diff inspection | **VERIFIED** (VALUE membership zero; no value-bearing work smuggled) |

## Selected Knowledge Evidence

Contributing-role returns inspected through the lineage: Coordinator (HL/TS/init rows E1–E2, re-freeze
`3f5eff6`, epoch binding `d5671d7`, owner-name completion `b0289ef`, TS approval `5c15596`), Executor
(`86d46a1` ONB, `cfc1d26` harness + first evidence round, `f83053d` RF + receipt + transition,
`b7a3f1d` measurement round), Researcher (`86f8cd9` iter1, `16b3ec1` iter2). No dispatch event exists:
activation is owner-direct, so no delegated edge, mandate or child scope is claimed and none is needed.
The Executor's own economics receipt is received and validated; the Reviewer's own receipt was added
under the same contract. No producer output was accepted on the strength of an Applied marker, a clean
tree or a file's presence.

## Checkpoint

**Self-check:**
- [x] Replayed the Map selection and verified all mandatory safety/security, authority and identity floors?
- [x] Established evidence applicability and ran every TS-required or dependency-affected check? (Live browser re-run was attempted and is impossible in this sandbox — named limit, not PASS.)
- [x] Recorded explicit limits instead of substituting file, discrepancy, test, commit or artifact counts?
- [x] Classified guards and controls by protected behavior, consequence and counterfactual detection?
- [x] Recorded every candidate finding with the complete item contract and material consequence test?
- [x] Verified RF AC claims, evidence references, citations and immutable accounting against actual artifacts?

Stage complete: YES
