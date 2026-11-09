# claude-mem：10 项独立改进

核验时间：2026-11-09 15:51:20 UTC。已创建 10 个主体上游 PR；实际 merged：0。

每项修复有独立分支、回归测试和已提交的运行时产物。生成产物、审查修正和验证任务都不增加独立改进数量。

## 当前检查状态

10 个最新提交的 Windows 和主类型检查、构建、测试任务均通过。#5580、#5582、#5583、#5585、#5587 的完整上游 CI 通过。#5579、#5581、#5586、#5588、#5589 的上游数据库集成任务保留失败状态；其相同命令、相同时间限制下的独立复测全部通过，未修改断言、超时或生产代码。

[独立数据库复测：9 个任务全部通过](https://github.com/Afloat16/claude-mem/actions/runs/42645899613)。其中 6 个任务验证具体当前提交，3 个任务验证原始基线。该证据不替代上游检查或合并权限。

| PR | 改进 | 当前提交 | 上游完整 CI |
| --- | --- | --- | --- |
| [#5579](https://github.com/thedotmack/claude-mem/pull/5579) | 遍历深层发布结果时避免递归栈溢出，并终止循环对象遍历。 | `d774c438b947` | [failure](https://github.com/thedotmack/claude-mem/actions/runs/42642512081) |
| [#5580](https://github.com/thedotmack/claude-mem/pull/5580) | 按原始活动时间排序工作列表，避免迟到导入把旧工作置顶。 | `8a266a750804` | [success](https://github.com/thedotmack/claude-mem/actions/runs/42642521409) |
| [#5581](https://github.com/thedotmack/claude-mem/pull/5581) | 保留已保存规则的空证据，避免恢复被明确清空的旧引用。 | `52477ad17ac0` | [failure](https://github.com/thedotmack/claude-mem/actions/runs/42640114967) |
| [#5582](https://github.com/thedotmack/claude-mem/pull/5582) | 使用独立临时文件原子写入账本，处理并发和失败清理。 | `8847f7c155b8` | [success](https://github.com/thedotmack/claude-mem/actions/runs/42642525291) |
| [#5583](https://github.com/thedotmack/claude-mem/pull/5583) | 将多行标题保留在同一 Markdown 表格行中，覆盖搜索与时间线。 | `c292f570e443` | [success](https://github.com/thedotmack/claude-mem/actions/runs/42640367208) |
| [#5585](https://github.com/thedotmack/claude-mem/pull/5585) | 在生成产物名称前过滤非法文件项，保留有效文件的原始索引。 | `d1d07672f413` | [success](https://github.com/thedotmack/claude-mem/actions/runs/42641771075) |
| [#5586](https://github.com/thedotmack/claude-mem/pull/5586) | 用 Set/Map 避免文件历史排名中的重复线性扫描。 | `75902142fb57` | [failure](https://github.com/thedotmack/claude-mem/actions/runs/42641881943) |
| [#5587](https://github.com/thedotmack/claude-mem/pull/5587) | 会话迁移或忽略后清理旧分组的失效证据链接。 | `e9ff83dc2bcf` | [success](https://github.com/thedotmack/claude-mem/actions/runs/42641892415) |
| [#5588](https://github.com/thedotmack/claude-mem/pull/5588) | 分批读取候选历史，避免 SQLite 参数上限，并及时释放语句。 | `d9f9eb9102b6` | [failure](https://github.com/thedotmack/claude-mem/actions/runs/42641995120) |
| [#5589](https://github.com/thedotmack/claude-mem/pull/5589) | 按事件时间重放目标更新，避免迟到旧记录覆盖当前状态。 | `7a8af27c4622` | [failure](https://github.com/thedotmack/claude-mem/actions/runs/42641168713) |

## 数据库复测明细

| 任务 | 实际检出源码 | 结果 |
| --- | --- | --- |
| [server search (pgvector · pg_textsearch) — base](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258935848) | `989a98a2fb7978354497df46c4e17101f54ba9a3` | success |
| [sync-api (postgres · protocol v2 · matrix e2e) — pr-5586](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936350) | `75902142fb57061283c7528fbccd48cebb5ad448` | success |
| [sync-api (postgres · protocol v2 · matrix e2e) — pr-5589](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936375) | `7a8af27c46224b6fd2dbe9a307e0f8d3562c8526` | success |
| [server-runtime e2e (docker · pg + valkey) — pr-5588](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936409) | `d9f9eb9102b64e4e13e9b2a5c8fd0c54b1b89ee4` | success |
| [server-runtime e2e (docker · pg + valkey) — base](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936514) | `989a98a2fb7978354497df46c4e17101f54ba9a3` | success |
| [sync-api (postgres · protocol v2 · matrix e2e) — base](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936711) | `989a98a2fb7978354497df46c4e17101f54ba9a3` | success |
| [server search (pgvector · pg_textsearch) — pr-5586](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936745) | `75902142fb57061283c7528fbccd48cebb5ad448` | success |
| [sync-api (postgres · protocol v2 · matrix e2e) — pr-5581](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936831) | `52477ad17ac0ce7f2c4a4d88707999fd05502e56` | success |
| [server-runtime e2e (docker · pg + valkey) — pr-5579](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936943) | `d774c438b947277592633c16efc0f9ba3329a0df` | success |

## 逐项技术说明与证据

### 1. fix(work-view): handle deeply nested publishing results

[上游 PR #5579](https://github.com/thedotmack/claude-mem/pull/5579) · 分支 `fix/work-product-deep-results` · 当前提交 `d774c438b947277592633c16efc0f9ba3329a0df`

#### Problem
A valid, deeply nested JSON result from a publishing tool overflows the recursive URL scan. One captured result can therefore interrupt work-product projection instead of showing the artifact it produced.

#### Changes
Traverse nested results with an explicit stack, preserving depth-first link order and the existing URL-field filter. Track visited objects so in-memory cyclic responses also terminate.


#### Regression coverage

Exercises 20,000-level nested results, depth-first URL ordering, and cyclic in-memory responses; the cyclic case runs in a bounded child process.

#### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `74fc454bc8e12f0b25dca98a10b1a372b067ee3e` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081856). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

Commit `d774c438b947277592633c16efc0f9ba3329a0df` completes the paired runtime update: the context-reader bundle consumes saved work state passed by the worker, and the MCP bundle exposes the work-state guidance during initialization. The packaging regression now requires that saved work state survive rendering through the built reader in a directory without `node_modules`.

The root TypeScript check and full `npm run build` passed for this update. The four generated reader/MCP files reproduce with the committed build configuration. The three focused publishing-result regressions also passed under Node.

Current-head checks: [Windows](https://github.com/thedotmack/claude-mem/actions/runs/42642512229) and [CI](https://github.com/thedotmack/claude-mem/actions/runs/42642512081).

#### Database integration verification

The current upstream CI failed at PostgreSQL deadlock during the Docker runtime test's API-key setup. Repeating the same job's test commands and time limits at exact commit `d774c438b947277592633c16efc0f9ba3329a0df` passed: [verification of this commit](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936943). The unchanged implementation base `989a98a2fb7978354497df46c4e17101f54ba9a3` passed the same checks: [baseline verification](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936514). These jobs use isolated checkouts and read-only repository permissions. No production change, assertion or timeout adjustment was needed to obtain these results.

The current head's upstream build/typecheck/test job and Windows workflow also passed. The earlier database failure was not reproduced in this check; the fork results do not change the upstream status, whose failed job still needs a maintainer rerun.

### 2. fix(work-view): order lists by original activity time

[上游 PR #5580](https://github.com/thedotmack/claude-mem/pull/5580) · 分支 `fix/work-list-activity-order` · 当前提交 `8a266a7508048a6521db61510c69a7a4ce28bc81`

#### Problem
Synced work-state rows receive new local IDs. Although replay already uses original timestamps, the final list order still used local row IDs. Importing old work therefore moved stale lists above recent activity and could set a project’s last-updated time to its oldest imported list.

#### Changes
Order the final lists by their latest activity timestamp, retaining the existing row-ID tie break. The revision watermark still uses local IDs, so polling behavior is unchanged.


#### Regression coverage

Exercises delayed imports, project timestamps, equal-timestamp tie breaks, and the unchanged revision watermark.

#### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `903a1c23ba5922362ca22227461b82dce7e2d3a8` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081517). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

Commit `8a266a7508048a6521db61510c69a7a4ce28bc81` completes the paired runtime update: the context-reader bundle consumes saved work state passed by the worker, and the MCP bundle exposes the work-state guidance during initialization. The packaging regression now requires that saved work state survive rendering through the built reader in a directory without `node_modules`.

The root TypeScript check and full `npm run build` passed for this update. The four generated reader/MCP files reproduce with the committed build configuration. Current-head checks: [CI](https://github.com/thedotmack/claude-mem/actions/runs/42642521409) and [Windows](https://github.com/thedotmack/claude-mem/actions/runs/42642521511).

### 3. fix(rules): preserve empty evidence in saved rules

[上游 PR #5581](https://github.com/thedotmack/claude-mem/pull/5581) · 分支 `fix/rule-empty-evidence` · 当前提交 `52477ad17ac0ce7f2c4a4d88707999fd05502e56`

#### Problem
Saved My Rules rows serialize an intentionally empty quote list as an empty string. Projection treated that value as missing and restored the old suggestion evidence, including quotes deliberately removed by the 2,000-character saved-row budget.

#### Changes
Use field presence to distinguish saved empty evidence from legacy rows without a quotes field. Saved quotes remain authoritative; legacy rows retain their existing fallback.


#### Regression coverage

Exercises explicitly empty quotes, quote-budget removal, legacy rows without a quotes field, and replacement quotes.

#### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `d08898368bb838b7dd738a9900fe5cdd2100bd70` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081711). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `d34263c571aaa0bfbf98c15ac4ec7245f669bf53`.

#### Database integration verification

The current upstream CI failed at review-fingerprint equality in the sync protocol matrix. Repeating the same job's test commands and time limits at exact commit `52477ad17ac0ce7f2c4a4d88707999fd05502e56` passed: [verification of this commit](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936831). The unchanged implementation base `989a98a2fb7978354497df46c4e17101f54ba9a3` passed the same checks: [baseline verification](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936711). These jobs use isolated checkouts and read-only repository permissions. No production change, assertion or timeout adjustment was needed to obtain these results.

The current head's upstream build/typecheck/test job and Windows workflow also passed. The earlier database failure was not reproduced in this check; the fork results do not change the upstream status, whose failed job still needs a maintainer rerun.

### 4. fix(work-view): use isolated atomic writes for ledger snapshots

[上游 PR #5582](https://github.com/thedotmack/claude-mem/pull/5582) · 分支 `fix/ledger-atomic-writes` · 当前提交 `8847f7c155b8fedcd6d665985d380ba651f4a662`

#### Problem
The request-progress CLI and worker write ledger snapshots through the same fixed temporary filename. Concurrent writes can overwrite or rename another writer’s in-progress file; failed renames also leave temporary files behind.

#### Changes
Reuse the existing atomic JSON writer, with unique temporary files, completed-payload flushing and cleanup on failure. Preserve private 0600 permissions, the DB-first redaction hook and completion ordering.


#### Regression coverage

Exercises occupied temporary paths, rename failure cleanup, private file permissions, and redaction-hook ordering.

#### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `032a1522f435fce029e6021ec54a0bea3c1d0eb9` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081658). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

Commit `8847f7c155b8fedcd6d665985d380ba651f4a662` completes the paired runtime update: the context-reader bundle consumes saved work state passed by the worker, and the MCP bundle exposes the work-state guidance during initialization. The packaging regression now requires that saved work state survive rendering through the built reader in a directory without `node_modules`.

The root TypeScript check and full `npm run build` passed for this update. The four generated reader/MCP files reproduce with the committed build configuration. Current-head checks: [CI](https://github.com/thedotmack/claude-mem/actions/runs/42642525291) and [Windows](https://github.com/thedotmack/claude-mem/actions/runs/42642525537).

### 5. fix(search): keep multiline titles inside a single table row

[上游 PR #5583](https://github.com/thedotmack/claude-mem/pull/5583) · 分支 `fix/search-table-line-breaks` · 当前提交 `c292f570e44369f1bd9e1053da849aa86e1f545e`

#### Problem
Observation titles, session requests and captured prompts can contain line breaks. Interpolating them directly into search and timeline tables splits one result across Markdown rows and can make it disappear when the timeline is read back.

#### Changes
Normalize line breaks in the six table-row formatters and the SearchManager timeline rows, including CRLF and Unicode line separators. Normalize prompt previews before applying the existing 60-character limit; stored text and full-detail responses remain unchanged.


#### Regression coverage

Eight regression cases cover six result row types, prompt-preview truncation, and SearchManager timeline rendering.

#### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `7f7c837ed428f9091ae74bd090e983f2f1e296cd` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081736). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `b67aba774695af8f283fd3d8d483773d53babc44`.

### 6. fix(work-view): skip invalid observation file entries before naming products

[上游 PR #5585](https://github.com/thedotmack/claude-mem/pull/5585) · 分支 `fix/observation-product-file-types` · 当前提交 `d1d07672f4138042ab0cfe7a545ac723de81adeb`

#### Problem
A saved observation can contain a mixed JSON file list. `fileKind` already rejects non-path entries, but projection still calls `basename` on them before checking that result. A null, number or object therefore throws and prevents the valid files in the same request from appearing.

#### Changes
Return early for rejected file entries before deriving a title. Preserve each valid file's original array index, which the file route uses to resolve the recorded path.


#### Regression coverage

Exercises mixed-type file lists, rejected string paths, generic index.html titles, and recorded-file lookup by the original array index.

#### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `a85128088209d1358d0144605d123c52664dbcc4` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081885). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `5544eedfc545a258e1a0e8db7f2d846386f99ca2`.

#### Runtime bundle follow-up

Commit `d1d07672f4138042ab0cfe7a545ac723de81adeb` also synchronizes the context reader and MCP server, with their source maps, with the rebuilt worker. This preserves saved work in session-start context and delivers the work-state rule through MCP initialization. The packaging fixture now checks that saved work survives the isolated reader alongside an existing observation.

The root TypeScript check and full bundle build pass on this branch. [CI for the updated commit](https://github.com/thedotmack/claude-mem/actions/runs/42641771075) is running.

### 7. perf(search): avoid repeated linear scans when ranking file histories

[上游 PR #5586](https://github.com/thedotmack/claude-mem/pull/5586) · 分支 `perf/hybrid-file-ranking-cost` · 当前提交 `75902142fb57061283c7528fbccd48cebb5ad448`

#### Problem
File recall repeatedly scans the growing ranked-ID array while appending metadata matches, then scans it again for every sort comparison. The in-memory ranking work grows quadratically for large histories even though membership and rank are fixed for the request.

#### Changes
Use sets for duplicate/membership checks and a rank map for sorting hydrated rows. Preserve the semantic prefix, metadata fallback order, explicit date ordering, limits and session results.


#### Regression coverage

Exercises duplicate semantic IDs, unmatched IDs, explicit date order, empty intersections, and a 50,000-observation history.

#### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `b5698e827b6c700d932f13597086e22026167c29` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081682). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `6f8e7a7868f2501d004977bb4c0817f26a1faae4`.

#### Runtime bundle follow-up

Commit `75902142fb57061283c7528fbccd48cebb5ad448` also synchronizes the context reader and MCP server, with their source maps, with the rebuilt worker. This preserves saved work in session-start context and delivers the work-state rule through MCP initialization. The packaging fixture now checks that saved work survives the isolated reader alongside an existing observation.

The root TypeScript check and full bundle build pass on this branch, and Windows CI has passed. [CI for the updated commit](https://github.com/thedotmack/claude-mem/actions/runs/42641881943) has two failed jobs: server search and Sync API both exceeded the existing 5-second limit in the same unchanged semantic-context-route test. Both corresponding jobs passed on the parent head against the same base. The [failure details and targeted rerun request](https://github.com/thedotmack/claude-mem/pull/5586#issuecomment-6743687952) include the job links, timings, and source comparison; these failures remain unresolved.

#### Database integration verification

The current upstream CI failed at the 5-second semantic-context limit test in the sync-api and pgvector jobs. Repeating the same job's test commands and time limits at exact commit `75902142fb57061283c7528fbccd48cebb5ad448` passed: [verification of this commit 1](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936350) and [verification of this commit 2](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936745). The unchanged implementation base `989a98a2fb7978354497df46c4e17101f54ba9a3` passed the same checks: [baseline verification 1](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936711) and [baseline verification 2](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258935848). These jobs use isolated checkouts and read-only repository permissions. No production change, assertion or timeout adjustment was needed to obtain these results.

The current head's upstream build/typecheck/test job and Windows workflow also passed. The earlier database failure was not reproduced in this check; the fork results do not change the upstream status, whose failed job still needs a maintainer rerun.

### 8. fix(work-view): remove stale group evidence when conversations move

[上游 PR #5587](https://github.com/thedotmack/claude-mem/pull/5587) · 分支 `fix/request-group-stale-links` · 当前提交 `e9ff83dc2bcfd2b3b87ac4988a993b19e04eea79`

#### Problem
Moving or ignoring a conversation updates the membership map, but link cleanup runs only for the destination group. The previous group can retain evidence that names a conversation now belonging elsewhere, so its recorded explanation no longer matches its actual members.

#### Changes
After applying all group and ignore decisions, prune each surviving group's links against final membership. Preserve links between remaining members and keep the stored input immutable.


#### Regression coverage

Exercises moved conversations, ignored conversations, unchanged membership, and preservation of the stored input.

#### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `cc4413722d92a0c67e2bab7488231931465ad760` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081205). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `a2dbaa0fe6a1caaf5c58817ec8a58f1e0ce60833`.

#### Runtime bundle follow-up

Commit `e9ff83dc2bcfd2b3b87ac4988a993b19e04eea79` also synchronizes the context reader and MCP server, with their source maps, with the rebuilt worker. This preserves saved work in session-start context and delivers the work-state rule through MCP initialization. The packaging fixture now checks that saved work survives the isolated reader alongside an existing observation.

The root TypeScript check and full bundle build pass on this branch. [CI for the updated commit](https://github.com/thedotmack/claude-mem/actions/runs/42641892415) is running.

### 9. fix(work-view): batch candidate history queries below SQLite limits

[上游 PR #5588](https://github.com/thedotmack/claude-mem/pull/5588) · 分支 `fix/request-candidate-query-batches` · 当前提交 `d9f9eb9102b64e4e13e9b2a5c8fd0c54b1b89ee4`

#### Problem
Large history scans and explicit conversation selections build one SQL statement containing every session ID. Once the selection exceeds SQLite's bound-parameter limit, the request-group reader fails instead of returning the owner's recorded work.

#### Changes
Read conversation selections in batches of 250 key pairs and related prompts, work-state writes, observation counts and tool activity in batches of 500 session IDs. Deduplicate session IDs before the related queries so repeated keys cannot duplicate asks. Preserve the final chronological ordering and existing activity projections. Finalize each prepared statement in a finally block.


#### Regression coverage

Exercises 35,000 sessions, a 17,000-conversation selection, duplicate keys across batches, empty selections, and data in the final batch.

#### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `38e6e76f094710518182267bea11ad7a6b3a9344` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081554). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `0642adb05ebaf19faa81942bdd951ca274e34567`.

#### Runtime bundle follow-up

Commit `d9f9eb9102b64e4e13e9b2a5c8fd0c54b1b89ee4` also synchronizes the context reader and MCP server, with their source maps, with the rebuilt worker. This preserves saved work in session-start context and delivers the work-state rule through MCP initialization. The packaging fixture now checks that saved work survives the isolated reader alongside an existing observation.

The root TypeScript check and full bundle build pass on this branch. [CI for the updated commit](https://github.com/thedotmack/claude-mem/actions/runs/42641995120) is running.

#### Database integration verification

The current upstream Docker runtime test failed with a PostgreSQL deadlock during API-key setup. Repeating the same job's test commands and time limits at exact commit `d9f9eb9102b64e4e13e9b2a5c8fd0c54b1b89ee4` passed: [verification of this commit](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936409). The unchanged implementation base `989a98a2fb7978354497df46c4e17101f54ba9a3` passed the same job: [baseline verification](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936514). These jobs use isolated checkouts and read-only repository permissions. No production change, assertion or timeout adjustment was needed to obtain these results.

The current head's upstream build/typecheck/test job and Windows workflow also passed. The earlier database failure was not reproduced in this check; the fork results do not change the upstream status, whose failed job still needs a maintainer rerun.

### 10. fix(work-view): replay owner goals in event order

[上游 PR #5589](https://github.com/thedotmack/claude-mem/pull/5589) · 分支 `fix/owner-goals-event-order` · 当前提交 `7a8af27c46224b6fd2dbe9a307e0f8d3562c8526`

#### Problem
The owner-goals reader folds patches in local insertion order. An older event imported after a newer decision therefore overwrites that decision: completed goals can become active again, and earlier summaries or cleared map paths can replace current state.

#### Changes
Replay owner-goal patches by their recorded creation time, with the existing row ID as a deterministic tie-breaker. This changes state reconstruction in the CLI goal reader; it is separate from sorting already-reconstructed work lists for display.


#### Regression coverage

Exercises late-imported state after completion, summaries and cleared map paths, and equal-timestamp ordering.

#### Validation and runtime artifacts

The root TypeScript check and full `npm run build` passed at source commit `3296271886b77e44cedb937b9f2bde493f843358` in the [isolated build job](https://github.com/Afloat16/claude-mem/actions/runs/42635396114/job/129222081685). The job also rebuilt the common base with the same installed dependencies and compared generated Node runtime artifacts. This PR includes the changed generated runtime bundles and source maps, so the installed plugin and CLI receive the source correction.

The upstream CI checks are attached to this PR. The runtime-artifact commit is `3da7bc602db017df72edeaa46f9d6608544d6c64`.

#### Database integration verification

The current upstream CI failed at review-fingerprint equality in the sync protocol matrix. Repeating the same job's test commands and time limits at exact commit `7a8af27c46224b6fd2dbe9a307e0f8d3562c8526` passed: [verification of this commit](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936375). The unchanged implementation base `989a98a2fb7978354497df46c4e17101f54ba9a3` passed the same checks: [baseline verification](https://github.com/Afloat16/claude-mem/actions/runs/42645899613/job/129258936711). These jobs use isolated checkouts and read-only repository permissions. No production change, assertion or timeout adjustment was needed to obtain these results.

The current head's upstream build/typecheck/test job and Windows workflow also passed. The earlier database failure was not reproduced in this check; the fork results do not change the upstream status, whose failed job still needs a maintainer rerun.

## 计数与证据边界

只按各个独立上游 PR 计数。实际 `merged=true` 才增加已合并数。定向测试、完整构建、上游矩阵和独立复测分别列出；没有把一次分支上的通过结果移植成另一个分支的通过声明。保留已存在的并发提交和运行时更新。

[机器可读记录](claude-mem.json) · [70 项总索引](README.md)
