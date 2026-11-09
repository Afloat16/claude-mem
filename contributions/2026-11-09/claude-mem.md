# Claude-mem: ten independent upstream fixes

Observed: 2026-11-09 15:10:46 UTC. All ten upstream PRs are created; 0 are merged. Each PR fixes a separate behavior and includes regression coverage. Additional build, review and delivery commits are excluded from this count.

| # | Improvement | Upstream PR | Latest head | Status |
|---|---|---|---|---|
| 1 | fix(work-view): handle deeply nested publishing results | [#5579](https://github.com/thedotmack/claude-mem/pull/5579) | [0dad2b74](https://github.com/Afloat16/claude-mem/commit/0dad2b743304d96bef765b9da5eee33a8ebca254) | open |
| 2 | fix(work-view): order lists by original activity time | [#5580](https://github.com/thedotmack/claude-mem/pull/5580) | [c74121e5](https://github.com/Afloat16/claude-mem/commit/c74121e59fe89981fd8571dfbaa704ee450c3a8d) | open |
| 3 | fix(rules): preserve empty evidence in saved rules | [#5581](https://github.com/thedotmack/claude-mem/pull/5581) | [52477ad1](https://github.com/Afloat16/claude-mem/commit/52477ad17ac0ce7f2c4a4d88707999fd05502e56) | open |
| 4 | fix(work-view): use isolated atomic writes for ledger snapshots | [#5582](https://github.com/thedotmack/claude-mem/pull/5582) | [dbf9518c](https://github.com/Afloat16/claude-mem/commit/dbf9518c2265d354acd825ada01d075f14a3d895) | open |
| 5 | fix(search): keep multiline titles inside a single table row | [#5583](https://github.com/thedotmack/claude-mem/pull/5583) | [c292f570](https://github.com/Afloat16/claude-mem/commit/c292f570e44369f1bd9e1053da849aa86e1f545e) | open |
| 6 | fix(work-view): skip invalid observation file entries before naming products | [#5585](https://github.com/thedotmack/claude-mem/pull/5585) | [d1d07672](https://github.com/Afloat16/claude-mem/commit/d1d07672f4138042ab0cfe7a545ac723de81adeb) | open |
| 7 | perf(search): avoid repeated linear scans when ranking file histories | [#5586](https://github.com/thedotmack/claude-mem/pull/5586) | [6f8e7a78](https://github.com/Afloat16/claude-mem/commit/6f8e7a7868f2501d004977bb4c0817f26a1faae4) | open |
| 8 | fix(work-view): remove stale group evidence when conversations move | [#5587](https://github.com/thedotmack/claude-mem/pull/5587) | [a2dbaa0f](https://github.com/Afloat16/claude-mem/commit/a2dbaa0fe6a1caaf5c58817ec8a58f1e0ce60833) | open |
| 9 | fix(work-view): batch candidate history queries below SQLite limits | [#5588](https://github.com/thedotmack/claude-mem/pull/5588) | [0642adb0](https://github.com/Afloat16/claude-mem/commit/0642adb05ebaf19faa81942bdd951ca274e34567) | open |
| 10 | fix(work-view): replay owner goals in event order | [#5589](https://github.com/thedotmack/claude-mem/pull/5589) | [7a8af27c](https://github.com/Afloat16/claude-mem/commit/7a8af27c46224b6fd2dbe9a307e0f8d3562c8526) | open |

## Runtime and validation

Every source fix passed the root TypeScript check and the complete bundle build. The runtime-artifact workflow rebuilt each revision and the common base with the same dependencies; changed generated Node bundles and source maps were committed to the respective feature branch. [All ten build jobs passed](https://github.com/Afloat16/claude-mem/actions/runs/42635396114).

PR #5580's latest upstream build job stopped while downloading onnxruntime-node (`ETIMEDOUT`). The remaining CI jobs and Windows passed. A separate exact-source run repeats the original build/test lane; it does not change the upstream check or its permissions. Full current per-head results are recorded in the JSON manifest.

## 1. fix(work-view): handle deeply nested publishing results

[Upstream PR #5579](https://github.com/thedotmack/claude-mem/pull/5579)

### Problem
A valid, deeply nested JSON result from a publishing tool overflows the recursive URL scan. One captured result can therefore interrupt work-product projection instead of showing the artifact it produced.

### Changes
Traverse nested results with an explicit stack, preserving depth-first link order and the existing URL-field filter. Track visited objects so in-memory cyclic responses also terminate.


### Regression coverage

Exercises 20,000-level nested results, depth-first URL ordering, and cyclic in-memory responses; the cyclic case runs in a bounded child process.

### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `74fc454bc8e12f0b25dca98a10b1a372b067ee3e` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081856). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `0dad2b743304d96bef765b9da5eee33a8ebca254`.

## 2. fix(work-view): order lists by original activity time

[Upstream PR #5580](https://github.com/thedotmack/claude-mem/pull/5580)

### Problem
Synced work-state rows receive new local IDs. Although replay already uses original timestamps, the final list order still used local row IDs. Importing old work therefore moved stale lists above recent activity and could set a project’s last-updated time to its oldest imported list.

### Changes
Order the final lists by their latest activity timestamp, retaining the existing row-ID tie break. The revision watermark still uses local IDs, so polling behavior is unchanged.


### Regression coverage

Exercises delayed imports, project timestamps, equal-timestamp tie breaks, and the unchanged revision watermark.

### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `903a1c23ba5922362ca22227461b82dce7e2d3a8` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081517). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `c74121e59fe89981fd8571dfbaa704ee450c3a8d`.

## 3. fix(rules): preserve empty evidence in saved rules

[Upstream PR #5581](https://github.com/thedotmack/claude-mem/pull/5581)

### Problem
Saved My Rules rows serialize an intentionally empty quote list as an empty string. Projection treated that value as missing and restored the old suggestion evidence, including quotes deliberately removed by the 2,000-character saved-row budget.

### Changes
Use field presence to distinguish saved empty evidence from legacy rows without a quotes field. Saved quotes remain authoritative; legacy rows retain their existing fallback.


### Regression coverage

Exercises explicitly empty quotes, quote-budget removal, legacy rows without a quotes field, and replacement quotes.

### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `d08898368bb838b7dd738a9900fe5cdd2100bd70` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081711). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `d34263c571aaa0bfbf98c15ac4ec7245f669bf53`.

## 4. fix(work-view): use isolated atomic writes for ledger snapshots

[Upstream PR #5582](https://github.com/thedotmack/claude-mem/pull/5582)

### Problem
The request-progress CLI and worker write ledger snapshots through the same fixed temporary filename. Concurrent writes can overwrite or rename another writer’s in-progress file; failed renames also leave temporary files behind.

### Changes
Reuse the existing atomic JSON writer, with unique temporary files, completed-payload flushing and cleanup on failure. Preserve private 0600 permissions, the DB-first redaction hook and completion ordering.


### Regression coverage

Exercises occupied temporary paths, rename failure cleanup, private file permissions, and redaction-hook ordering.

### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `032a1522f435fce029e6021ec54a0bea3c1d0eb9` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081658). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `dbf9518c2265d354acd825ada01d075f14a3d895`.

## 5. fix(search): keep multiline titles inside a single table row

[Upstream PR #5583](https://github.com/thedotmack/claude-mem/pull/5583)

### Problem
Observation titles, session requests and captured prompts can contain line breaks. Interpolating them directly into search and timeline tables splits one result across Markdown rows and can make it disappear when the timeline is read back.

### Changes
Normalize line breaks in the six table-row formatters and the SearchManager timeline rows, including CRLF and Unicode line separators. Normalize prompt previews before applying the existing 60-character limit; stored text and full-detail responses remain unchanged.


### Regression coverage

Eight regression cases cover six result row types, prompt-preview truncation, and SearchManager timeline rendering.

### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `7f7c837ed428f9091ae74bd090e983f2f1e296cd` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081736). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `b67aba774695af8f283fd3d8d483773d53babc44`.

## 6. fix(work-view): skip invalid observation file entries before naming products

[Upstream PR #5585](https://github.com/thedotmack/claude-mem/pull/5585)

### Problem
A saved observation can contain a mixed JSON file list. `fileKind` already rejects non-path entries, but projection still calls `basename` on them before checking that result. A null, number or object therefore throws and prevents the valid files in the same request from appearing.

### Changes
Return early for rejected file entries before deriving a title. Preserve each valid file's original array index, which the file route uses to resolve the recorded path.


### Regression coverage

Exercises mixed-type file lists, rejected string paths, generic index.html titles, and recorded-file lookup by the original array index.

### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `a85128088209d1358d0144605d123c52664dbcc4` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081885). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `5544eedfc545a258e1a0e8db7f2d846386f99ca2`.

## 7. perf(search): avoid repeated linear scans when ranking file histories

[Upstream PR #5586](https://github.com/thedotmack/claude-mem/pull/5586)

### Problem
File recall repeatedly scans the growing ranked-ID array while appending metadata matches, then scans it again for every sort comparison. The in-memory ranking work grows quadratically for large histories even though membership and rank are fixed for the request.

### Changes
Use sets for duplicate/membership checks and a rank map for sorting hydrated rows. Preserve the semantic prefix, metadata fallback order, explicit date ordering, limits and session results.


### Regression coverage

Exercises duplicate semantic IDs, unmatched IDs, explicit date order, empty intersections, and a 50,000-observation history.

### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `b5698e827b6c700d932f13597086e22026167c29` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081682). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `6f8e7a7868f2501d004977bb4c0817f26a1faae4`.

## 8. fix(work-view): remove stale group evidence when conversations move

[Upstream PR #5587](https://github.com/thedotmack/claude-mem/pull/5587)

### Problem
Moving or ignoring a conversation updates the membership map, but link cleanup runs only for the destination group. The previous group can retain evidence that names a conversation now belonging elsewhere, so its recorded explanation no longer matches its actual members.

### Changes
After applying all group and ignore decisions, prune each surviving group's links against final membership. Preserve links between remaining members and keep the stored input immutable.


### Regression coverage

Exercises moved conversations, ignored conversations, unchanged membership, and preservation of the stored input.

### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `cc4413722d92a0c67e2bab7488231931465ad760` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081205). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `a2dbaa0fe6a1caaf5c58817ec8a58f1e0ce60833`.

## 9. fix(work-view): batch candidate history queries below SQLite limits

[Upstream PR #5588](https://github.com/thedotmack/claude-mem/pull/5588)

### Problem
Large history scans and explicit conversation selections build one SQL statement containing every session ID. Once the selection exceeds SQLite's bound-parameter limit, the request-group reader fails instead of returning the owner's recorded work.

### Changes
Read conversation selections in batches of 250 key pairs and related prompts, work-state writes, observation counts and tool activity in batches of 500 session IDs. Deduplicate session IDs before the related queries so repeated keys cannot duplicate asks. Preserve the final chronological ordering and existing activity projections. Finalize each prepared statement in a finally block.


### Regression coverage

Exercises 35,000 sessions, a 17,000-conversation selection, duplicate keys across batches, empty selections, and data in the final batch.

### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `38e6e76f094710518182267bea11ad7a6b3a9344` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081554). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `0642adb05ebaf19faa81942bdd951ca274e34567`.

## 10. fix(work-view): replay owner goals in event order

[Upstream PR #5589](https://github.com/thedotmack/claude-mem/pull/5589)

### Problem
The owner-goals reader folds patches in local insertion order. An older event imported after a newer decision therefore overwrites that decision: completed goals can become active again, and earlier summaries or cleared map paths can replace current state.

### Changes
Replay owner-goal patches by their recorded creation time, with the existing row ID as a deterministic tie-breaker. This changes state reconstruction in the CLI goal reader; it is separate from sorting already-reconstructed work lists for display.


### Regression coverage

Exercises late-imported state after completion, summaries and cleared map paths, and equal-timestamp ordering.

### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `3296271886b77e44cedb937b9f2bde493f843358` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081685). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `3da7bc602db017df72edeaa46f9d6608544d6c64`.

