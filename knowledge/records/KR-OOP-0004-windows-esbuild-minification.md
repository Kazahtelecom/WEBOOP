# Knowledge record — KR-OOP-0004: Vite production build with esbuild minification disabled on Windows

> One material claim/decision and its completed or explicitly unresolved disposition.
> Presence is not acceptance. Fill applicable fields; reasoned N/A only when inapplicable.

| Field | Value |
|---|---|
| Record identity | `KR-OOP-0004` (locally allocated under `knowledge/records/`) |
| Publication intent | Document the configuration decision to set `build.minify: false` in `vite.config.ts` on Windows environments to prevent esbuild temporary file locking collisions (`Access is denied`), enabling fast and reliable builds; retain on equal retry |
| Kind | technical-reference decision |
| Statement | In `vite.config.ts`, build minification is configured as `minify: false`. On Windows platforms, esbuild's internal temporary file cleanup during parallel minification frequently encounters `Access is denied (os error 5)` due to Windows filesystem file-handle locks. Disabling minification completely resolves the error, yields a clean production build in under 3.6 seconds, and produces a fully functional client bundle without affecting runtime execution or typing. |
| Applicability | Vite build pipeline (`npm run build`) in WEBOOP on Windows OS development and build machines. |
| Grounds and uncertainty | Observed, analyzed and resolved during task `OOP_20261010-074918_LFRS` (RF §2 item 1; EV row E1 in `evidence/EV__OOP_20261010-074918_LFRS.md`). Verified build time 2.84s–3.54s across multiple clean runs. **Uncertainty:** For public internet production deployments over narrow-bandwidth connections, unminified JS bundle size (~250 KB uncompressed vs ~80 KB minified) could be re-evaluated if a build environment with non-locking filesystem semantics (e.g. Linux CI/CD) is introduced. |
| Disposition | accepted |
| Source | `RF__OOP_20261010-074918_LFRS.md` §2 item 1; `vite.config.ts`; Candidate commit `7baefec3c74074691d6226352035686f5f96a9b7`. |
| Originating task and unit | `OOP_20261010-074918_LFRS`, Executor `antigravity:executor:local:OOP_20261010-074918_LFRS` |
| Producer | Coordinator `antigravity:coordinator:local:OOP_20261010-074918_LFRS` |
| Qualifier | Reviewer `antigravity:reviewer:local:OOP_20261010-074918_LFRS`, ruling APPROVE in `REVIEW__OOP_20261010-074918_LFRS.md` |
| Acceptance authority | Owner `zhassulan` |
| Completed effect or missing decision | Published under `knowledge/records/KR-OOP-0004-windows-esbuild-minification.md` and referenced in `KNOWLEDGE.md`. |
| Relations | No conflicting records. |

## Source and decision context

During development of the LMS foundation on Windows, executing `vite build` failed intermittently with `Build failed with 1 error: ... Access is denied. (os error 5)`. The root cause is esbuild's concurrent process attempting to unlink temporary chunk files while virus scanners, Windows indexing, or OneDrive background syncing retain open file descriptors. Setting `build: { minify: false }` eliminates esbuild's temp chunk shuffling, producing an immediate reliable build.

## Relations and current use

Read this record before altering `vite.config.ts` build options or adding bundler plugins that manipulate file-system artifacts during compilation.

## Retry and continuation

An equal retry reuses `minify: false` in `vite.config.ts`. A divergent intent — such as migrating CI/CD to a containerized Linux pipeline where esbuild minification or Terser is re-enabled — is a new decision and record.
