# 70 项独立上游改进：提交与合并记录

核验时间：2026-11-09 17:15:24 UTC。作者：Afloat16。

已创建 **70 个主改进的正式上游 PR**；实际状态为 **27 个 merged / 43 个 open / 0 个关闭未合并**。按独立主改进计算，合并目标当前为 **27/70**，仍有 43 项尚未被上游合并。

另有 **3 个审阅补充修复 PR，2 个已合并、1 个开放**。这些补修归入原主改进，目标计数增加为 0。生成运行时产物、验证分支、测试用 fork PR、前置 issue 和交付记录同样不增加主改进数量。

## 项目进度

| 项目 | 目标 | 已创建主 PR | 已合并 | 开放待处理 | 关闭未合并 |
| --- | ---: | ---: | ---: | ---: | ---: |
| storytold/craft-anything | 30 | 30 | 27 | 3 | 0 |
| vercel-labs/agent-browser | 10 | 10 | 0 | 10 | 0 |
| milind-soni/OpenMausBot | 10 | 10 | 0 | 10 | 0 |
| ranxianglei/billion-context | 10 | 10 | 0 | 10 | 0 |
| thedotmack/claude-mem | 10 | 10 | 0 | 10 | 0 |

## 质量与计数依据

每组候选对照 Afloat16 与上游的历史 PR、相关文件及已实现行为，材料逐项记录相邻工作与技术区别。craft-anything 的筛查包含 927 条上游 PR、206 条用户历史 PR 和 280 个 fork 分支名称。各项目报告说明实际筛查范围；不声称对所有历史补丁做了穷尽的语义比较。

验证记录区分实际执行的源码 SHA、仅文档跟进的最新 SHA、普通上游整合、定向回归、完整 crate 测试和完整上游 CI。旧代码的预期失败用于证明回归。多个分支重复运行公共测试时，按测试执行次数记录，不当作独立新增用例。性能改进说明算法与覆盖规模，没有填写未测量的加速百分比。

## 验证结果与尚待上游处理的事项

| 项目 | 已完成的验证 | 当前边界 |
| --- | --- | --- |
| craft-anything | 各项记录对应精确源码的 fmt、完整 formats 测试、clippy 和 L0 检查；安装器补修另跑 engines 测试。ASAR 最终整合 1,072 项通过；GNU 记录范围修复 1,200 项通过、0 失败、1 项已有网络测试忽略。 | 主项 [#1364](https://github.com/storytold/craft-anything/pull/1364)、[#1369](https://github.com/storytold/craft-anything/pull/1369)、[#1383](https://github.com/storytold/craft-anything/pull/1383) 仍开放；补修 [#1402](https://github.com/storytold/craft-anything/pull/1402) 也待上游处理。 |
| agent-browser | 10 个精确源码版本均通过 dashboard 定向回归及 Next.js 生产构建。记录的每个上游头有 4 项安全/审查检查成功。 | Vercel 部署检查需要 Vercel Labs 团队授权；未把它写成代码测试通过，也未声称运行完整上游仓库套件。 |
| OpenMausBot | 10 个当前源码版本均通过完整项目 typecheck 和针对性回归，共 327 次测试执行、18 次测试文件执行。#5085 最终 54/54，另通过 lint、真实代理回环转发与官方隔离服务 doctor。 | 完整仓库套件和外部供应商流程未运行。#5085 两条数值缺陷反馈已解决；两条 JSON 容器拟合策略建议已回复，保留给维护者判断。 |
| billion-context | 10 个行为版本有定向测试、typecheck 和 build 证据；9 个最新头的上游主 CI 成功。#6046 的 golden 修正及完整上游主 CI 通过。 | #6047 原上游 Windows abort 用例仍保留失败状态；相同基线和补丁的隔离 Windows 复测均通过，不能替代上游状态。 |
| claude-mem | 10 个最新头的 Windows 和上游主 build/typecheck/test 任务通过；5 个完整上游 CI 成功。数据库独立复测的 6 个精确源码任务及 3 个未改基线任务全部成功。 | #5579、#5581、#5586、#5588、#5589 的原上游数据库任务仍失败，等待有权限的维护者重跑；未改变断言、超时或生产代码来绕过。 |

关键证据：[最终 ASAR 与 GNU tar 验证](https://github.com/Afloat16/claude-mem/actions/runs/42659466852/job/129306793039)、[OpenMausBot 数值修复验证](https://github.com/Afloat16/claude-mem/actions/runs/42659914559/job/129308380945)、[claude-mem 9 个数据库复测任务](https://github.com/Afloat16/claude-mem/actions/runs/42645899613)。完整命令、源码 SHA、基线失败和各组限制见下面的专项报告。

## craft-anything：归档与压缩（10 项）

[完整验证、历史去重与提交材料](https://github.com/Afloat16/craft-anything/blob/submission-materials/archives-20261109/contributions/archives-20261109/README.md)

| 序号 | 实际改进 | 正式上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 1 | 限制 PyInstaller CArchive 成员读取范围，防止把目录、cookie 或签名尾部当作载荷。 | [#1363](https://github.com/storytold/craft-anything/pull/1363) | **Merged** |
| 2 | 校验 ASAR 文件、目录、链接节点的元数据，避免畸形节点变成伪空文件。 | [#1364](https://github.com/storytold/craft-anything/pull/1364) | Open |
| 3 | 验证 gzip 可选头校验和，并兼容合法的 OS/XFL 信息字段。 | [#1371](https://github.com/storytold/craft-anything/pull/1371) | **Merged** |
| 4 | 完整读取 gzip 串联成员，逐一验证 CRC/ISIZE，并共享解压输出预算。 | [#1372](https://github.com/storytold/craft-anything/pull/1372) | **Merged** |
| 5 | 增加 ZIP 的 bzip2/XZ 方法支持，继续校验大小、CRC 和解压预算。 | [#1374](https://github.com/storytold/craft-anything/pull/1374) | **Merged** |
| 6 | 增加 ZIP LZMA 方法支持，验证 framing、结束标记及输出预算。 | [#1375](https://github.com/storytold/craft-anything/pull/1375) | **Merged** |
| 7 | 在增长 LZMA 字典前检查声明大小与内存预算。 | [#1381](https://github.com/storytold/craft-anything/pull/1381) | **Merged** |
| 8 | 保持 GNU tar 长名称和链接的完整身份，避免截断后发生名称混淆。 | [#1362](https://github.com/storytold/craft-anything/pull/1362) | **Merged** |
| 9 | 识别 GNU sparse tar 条目，避免把稀疏载荷误当普通文件解出。 | [#1382](https://github.com/storytold/craft-anything/pull/1382) | **Merged** |
| 10 | 支持串联 XZ 流和合法填充，并统一限制输出、校验索引。 | [#1383](https://github.com/storytold/craft-anything/pull/1383) | Open |

## craft-anything：原生二进制格式（10 项）

[完整验证、历史去重与提交材料](https://github.com/Afloat16/craft-anything/blob/docs/r3.12-native-contribution-delivery-20261109/contribution-delivery/2026-11-09-native/README.md)

| 序号 | 实际改进 | 正式上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 11 | 为同名导入保留各自所属库的槽位，保留解析器已确定的槽。 | [#1365](https://github.com/storytold/craft-anything/pull/1365) | **Merged** |
| 12 | 按原始字节推进 ELF core 的文件路径游标，避免乱码或预览截断使后续路径错位。 | [#1366](https://github.com/storytold/craft-anything/pull/1366) | **Merged** |
| 13 | 在仅保留部分 ELF 节的文件中，通过动态段恢复缺失的导入和导出。 | [#1367](https://github.com/storytold/craft-anything/pull/1367) | **Merged** |
| 14 | 将 ELF 符号版本读取限制在声明的节范围内。 | [#1368](https://github.com/storytold/craft-anything/pull/1368) | **Merged** |
| 15 | 限制 PE 普通、延迟和 bound import 目录读取范围，报告不完整记录。 | [#1369](https://github.com/storytold/craft-anything/pull/1369) | Open |
| 16 | 校验 PE RVA 与 image base 的地址加法，避免虚拟地址回绕。 | [#1370](https://github.com/storytold/craft-anything/pull/1370) | **Merged** |
| 17 | 分别限制 PE 导出表扫描量和输出量，覆盖别名及空函数槽。 | [#1384](https://github.com/storytold/craft-anything/pull/1384) | **Merged** |
| 18 | 按 Mach-O CPU 和完整线程状态记录提取入口点。 | [#1385](https://github.com/storytold/craft-anything/pull/1385) | **Merged** |
| 19 | 对整份 Mach-O 的所有间接导入节使用共享扫描预算。 | [#1386](https://github.com/storytold/craft-anything/pull/1386) | **Merged** |
| 20 | 校验 Objective-C 方法记录步长和完整字节范围。 | [#1387](https://github.com/storytold/craft-anything/pull/1387) | **Merged** |

## craft-anything：其他格式与纹理（10 项）

[完整验证、历史去重与提交材料](https://github.com/Afloat16/craft-anything/blob/contribution-records/formats-other-2026-11-09/contribution-records/formats-other-2026-11-09/README.md)

| 序号 | 实际改进 | 正式上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 21 | 拒绝超出 Java 常量池声明槽位的 Long/Double，避免最大索引溢出。 | [#1373](https://github.com/storytold/craft-anything/pull/1373) | **Merged** |
| 22 | 禁止嵌入式 Godot PCK 的目录或成员借用尾部 trailer 字节。 | [#1379](https://github.com/storytold/craft-anything/pull/1379) | **Merged** |
| 23 | 约束 Node SEA 资产、参数和解码文本的累计保留预算。 | [#1377](https://github.com/storytold/craft-anything/pull/1377) | **Merged** |
| 24 | 按实际 UTF-8 输出字节限制 IL2CPP 字面量，保留字符边界。 | [#1380](https://github.com/storytold/craft-anything/pull/1380) | **Merged** |
| 25 | 支持 Unity R16/RG16 纹理解码，保留行方向和像素预算。 | [#1378](https://github.com/storytold/craft-anything/pull/1378) | **Merged** |
| 26 | DEX 成员或异常处理表达到上限时保留游标边界，避免伪造后续记录。 | [#1388](https://github.com/storytold/craft-anything/pull/1388) | **Merged** |
| 27 | 确保 Android ARSC 子块位于其父块范围内。 | [#1389](https://github.com/storytold/craft-anything/pull/1389) | **Merged** |
| 28 | 对 WebAssembly 重复自定义节的名称和 producer 元数据使用累计预算。 | [#1390](https://github.com/storytold/craft-anything/pull/1390) | **Merged** |
| 29 | 读取 Unity 序列化元数据前验证其范围，避免越界或吞入对象数据。 | [#1391](https://github.com/storytold/craft-anything/pull/1391) | **Merged** |
| 30 | 支持 Unreal 半精度和全精度浮点纹理导出，并正确处理 RGB/alpha。 | [#1392](https://github.com/storytold/craft-anything/pull/1392) | **Merged** |

## agent-browser（10 项）

[完整验证、历史去重与提交材料](https://github.com/Afloat16/agent-browser/blob/submission-materials/dashboard-20261109/contributions/dashboard-20261109/README.md)

| 序号 | 实际改进 | 正式上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 31 | 清空仪表盘日志后，新事件不会把旧日志恢复出来。 | [#2495](https://github.com/vercel-labs/agent-browser/pull/2495) | Open |
| 32 | 会话更换端口后重新加载活动历史。 | [#2496](https://github.com/vercel-labs/agent-browser/pull/2496) | Open |
| 33 | 将畸形命令响应显示为错误，避免误报执行成功。 | [#2497](https://github.com/vercel-labs/agent-browser/pull/2497) | Open |
| 34 | 从命令响应 envelope 中正确读取浏览器 storage 数据。 | [#2498](https://github.com/vercel-labs/agent-browser/pull/2498) | Open |
| 35 | 阻止旧 storage 请求覆盖当前会话的数据。 | [#2499](https://github.com/vercel-labs/agent-browser/pull/2499) | Open |
| 36 | 关闭会话失败后恢复按钮和重试能力。 | [#2500](https://github.com/vercel-labs/agent-browser/pull/2500) | Open |
| 37 | 将网络响应详情绑定到当前选择的请求，避免交叉显示。 | [#2501](https://github.com/vercel-labs/agent-browser/pull/2501) | Open |
| 38 | 避免重叠的会话轮询，并在卸载时取消未完成请求。 | [#2502](https://github.com/vercel-labs/agent-browser/pull/2502) | Open |
| 39 | 丢弃过期视频帧，及时释放已解码的 ImageBitmap。 | [#2503](https://github.com/vercel-labs/agent-browser/pull/2503) | Open |
| 40 | 浏览器 storage 不可用时保持仪表盘可用。 | [#2504](https://github.com/vercel-labs/agent-browser/pull/2504) | Open |

## OpenMausBot（10 项）

[完整验证、历史去重与提交材料](https://github.com/Afloat16/OpenMausBot/blob/contribution-records/2026-11-09/contribution-records/openmausbot-2026-11-09.md)

| 序号 | 实际改进 | 正式上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 41 | 释放重试退避计时器和 abort 监听器，避免长期积累。 | [#5083](https://github.com/milind-soni/OpenMausBot/pull/5083) | Open |
| 42 | 自动化任务正在运行时保留之前的失败历史。 | [#5084](https://github.com/milind-soni/OpenMausBot/pull/5084) | Open |
| 43 | 保留不能安全转换的连接器数字参数，避免精度丢失。 | [#5085](https://github.com/milind-soni/OpenMausBot/pull/5085) | Open |
| 44 | 在 CRLF 跨网络片段时保持 MCP SSE 消息边界。 | [#5086](https://github.com/milind-soni/OpenMausBot/pull/5086) | Open |
| 45 | 严格校验新 TOTP 密钥的 Base32 分组，并兼容历史保存的密钥。 | [#5087](https://github.com/milind-soni/OpenMausBot/pull/5087) | Open |
| 46 | 从解析后的 Codex 配置识别 MCP 名称冲突，保留各挂载和权限边界。 | [#5088](https://github.com/milind-soni/OpenMausBot/pull/5088) | Open |
| 47 | 在线程检查器保留预算耗尽事件及有效交接路径。 | [#5089](https://github.com/milind-soni/OpenMausBot/pull/5089) | Open |
| 48 | 按 Unicode 边界拆分无空格语音，兼顾标点和组合字符。 | [#5090](https://github.com/milind-soni/OpenMausBot/pull/5090) | Open |
| 49 | 拒绝日期自动进位形成的错误日历日期。 | [#5091](https://github.com/milind-soni/OpenMausBot/pull/5091) | Open |
| 50 | 按请求 ID 匹配 MCP 响应，避免缓存错位工具列表并保留错误诊断。 | [#5092](https://github.com/milind-soni/OpenMausBot/pull/5092) | Open |

## billion-context（10 项）

[完整验证、历史去重与提交材料](https://github.com/Afloat16/billion-context/blob/2026-11-09_contribution-delivery/contribution-delivery/2026-11-09/README.md)

| 序号 | 实际改进 | 正式上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 51 | 消除 SimHash 投票计数溢出，减少重复文本之间的错误碰撞。 | [#6046](https://github.com/ranxianglei/billion-context/pull/6046) | Open |
| 52 | 拒绝损坏的位置型相似度快照，防止证据错配到其他消息。 | [#6047](https://github.com/ranxianglei/billion-context/pull/6047) | Open |
| 53 | 迭代统计深层 JSON 媒体字节，避免递归栈溢出。 | [#6048](https://github.com/ranxianglei/billion-context/pull/6048) | Open |
| 54 | 健康检查响应体超时时保留 busy 状态，避免误判服务死亡。 | [#6049](https://github.com/ranxianglei/billion-context/pull/6049) | Open |
| 55 | GC 删除失败时继续计入保留字节，维持真实存储预算。 | [#6050](https://github.com/ranxianglei/billion-context/pull/6050) | Open |
| 56 | 客户端断开后取消闲置的上游流读取并清理监听器。 | [#6051](https://github.com/ranxianglei/billion-context/pull/6051) | Open |
| 57 | SSE 转储遵守背压，并等待文件完成或传播失败。 | [#6052](https://github.com/ranxianglei/billion-context/pull/6052) | Open |
| 58 | 调度前校验 attach 时间戳，并撤销失效或缺失观测的旧闹钟。 | [#6053](https://github.com/ranxianglei/billion-context/pull/6053) | Open |
| 59 | 水位缓存达到容量时仅逐出最旧会话，保留其他握手状态。 | [#6054](https://github.com/ranxianglei/billion-context/pull/6054) | Open |
| 60 | 身份回填兼容 JSON null、标量和数组，避免 SQLite 迁移中断。 | [#6055](https://github.com/ranxianglei/billion-context/pull/6055) | Open |

## claude-mem（10 项）

[完整验证、历史去重与提交材料](https://github.com/Afloat16/claude-mem/blob/submission-materials/seventy-improvements-20261109/contributions/2026-11-09/claude-mem.md)

| 序号 | 实际改进 | 正式上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 61 | 遍历深层发布结果时避免递归栈溢出，并终止循环对象遍历。 | [#5579](https://github.com/thedotmack/claude-mem/pull/5579) | Open |
| 62 | 按原始活动时间排序工作列表，避免迟到导入把旧工作置顶。 | [#5580](https://github.com/thedotmack/claude-mem/pull/5580) | Open |
| 63 | 保留已保存规则的空证据，避免恢复被明确清空的旧引用。 | [#5581](https://github.com/thedotmack/claude-mem/pull/5581) | Open |
| 64 | 使用独立临时文件原子写入账本，处理并发和失败清理。 | [#5582](https://github.com/thedotmack/claude-mem/pull/5582) | Open |
| 65 | 将多行标题保留在同一 Markdown 表格行中，覆盖搜索与时间线。 | [#5583](https://github.com/thedotmack/claude-mem/pull/5583) | Open |
| 66 | 在生成产物名称前过滤非法文件项，保留有效文件的原始索引。 | [#5585](https://github.com/thedotmack/claude-mem/pull/5585) | Open |
| 67 | 用 Set/Map 避免文件历史排名中的重复线性扫描。 | [#5586](https://github.com/thedotmack/claude-mem/pull/5586) | Open |
| 68 | 会话迁移或忽略后清理旧分组的失效证据链接。 | [#5587](https://github.com/thedotmack/claude-mem/pull/5587) | Open |
| 69 | 分批读取候选历史，避免 SQLite 参数上限，并及时释放语句。 | [#5588](https://github.com/thedotmack/claude-mem/pull/5588) | Open |
| 70 | 按事件时间重放目标更新，避免迟到旧记录覆盖当前状态。 | [#5589](https://github.com/thedotmack/claude-mem/pull/5589) | Open |

## 审阅补充修复：单独记录，不增加 70 项计数

| 补充 PR | 对应主改进 | 解决的问题 | 状态 |
| --- | --- | --- | --- |
| [#1393](https://github.com/storytold/craft-anything/pull/1393) | [#1365](https://github.com/storytold/craft-anything/pull/1365) 导入槽位身份 | 保留 ELF 版本库元数据下可唯一确定的槽位，同时要求槽地址和导入库身份均无歧义。 | **Merged** |
| [#1394](https://github.com/storytold/craft-anything/pull/1394) | [#1362](https://github.com/storytold/craft-anything/pull/1362) GNU tar 名称身份 | 将超长名称/链接和短缺元数据正文的停止原因传给安装器，在写出任何成员前拒绝；保留解析器的部分列表与无结束标记兼容性。 | **Merged** |
| [#1402](https://github.com/storytold/craft-anything/pull/1402) | [#1362](https://github.com/storytold/craft-anything/pull/1362)，并跟进 [#1394](https://github.com/storytold/craft-anything/pull/1394) | 拒绝 GNU L/K 记录正文完整但 512 字节填充不足、或填充范围计算溢出的归档，保留已有安装文件。 | Open |

#1402 的未改生产代码基线实测 4 项失败、7 项控制通过；修正后的完整 formats/engines 测试为 1,200 项通过、0 失败、1 项已有网络测试忽略。最新头仅在精确被测源码后加入 ROADMAP/STATUS 验证记录。原 [#1362 线程](https://github.com/storytold/craft-anything/pull/1362#discussion_r4515588389)和 [#1365 线程](https://github.com/storytold/craft-anything/pull/1365#discussion_r4515322355)已关闭；[#1394 的填充反馈](https://github.com/storytold/craft-anything/pull/1394#discussion_r4515633445)已关联 #1402，保留待上游处理。

## 已有 PR 正文维护

已按用户的表述要求修正以下 6 个既有 PR 正文，并回读确认。源码提交未变，技术说明与测试证据保留；这项文字维护不计为新增改进。

- [morluto/rea #9238](https://github.com/morluto/rea/pull/9238)
- [morluto/rea #9279](https://github.com/morluto/rea/pull/9279)
- [morluto/rea #9063](https://github.com/morluto/rea/pull/9063)
- [morluto/rea #9083](https://github.com/morluto/rea/pull/9083)
- [morluto/rea #9084](https://github.com/morluto/rea/pull/9084)
- [HIPS/autograd #833](https://github.com/HIPS/autograd/pull/833)

## 可核验记录

[机器可读完整清单](manifest.json)包含全部 70 个主 PR 的源码、当前头、真实合并时间与合并提交、验证来源、审阅跟进和补充修复。状态是上述核验时刻的 GitHub 快照；开放 PR 的最终接收与合并由各上游项目决定。
