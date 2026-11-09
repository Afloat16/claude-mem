# 70 项独立上游改进：提交与合并记录

核验时间：2026-11-09 15:39:11 UTC。作者：Afloat16。

已创建 **70 个主体上游 PR**，当前 **8 个 merged / 62 个 open / 0 个关闭未合并**。按 GitHub 的真实合并状态统计；未合并 PR 不计入 merged 成果。

修复、生成运行时产物、验证分支、测试用 fork PR、前置 issue 和本报告都不增加独立改进数量。当前继续处理已收到的具体反馈和数据库集成检查；结果随本报告更新。

## 项目进度

| 项目 | 目标 | 主体上游 PR | 已合并 | 待合并 |
| --- | ---: | ---: | ---: | ---: |
| storytold/craft-anything | 30 | 30 | 8 | 22 |
| vercel-labs/agent-browser | 10 | 10 | 0 | 10 |
| milind-soni/OpenMausBot | 10 | 10 | 0 | 10 |
| ranxianglei/billion-context | 10 | 10 | 0 | 10 |
| thedotmack/claude-mem | 10 | 10 | 0 | 10 |

## 质量与计数依据

候选项对照用户和上游的已打开、已关闭及已合并记录，并核对相关代码路径、已有修复和格式边界。craft-anything 的筛查包含 927 条上游 PR、206 条用户历史 PR，以及 280 个 fork 分支名称；具体邻近改进及区别见各组证据报告。该筛查记录其覆盖范围，不把标题不同当作技术上不同。

验证记录区分实际执行的源码 SHA、仅文档跟进的最新 SHA、定向回归、完整项目构建及上游完整 CI。旧代码的预期失败仅用于证明回归，绝不视为通过。多个分支运行同一套公共测试，不累计为新增测试数量。性能变化说明算法和覆盖规模，未测量的加速比例不作声明。

## craft-anything：归档与压缩（10）

[完整验证、去重与提交材料](https://github.com/Afloat16/craft-anything/blob/submission-materials/archives-20261109/contributions/archives-20261109/README.md)

| 项 | 实际改进 | 上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 1 | 限制 PyInstaller CArchive 成员读取范围，防止把目录、cookie 或签名尾部当作载荷。 | [#1363](https://github.com/storytold/craft-anything/pull/1363) | Open |
| 2 | 校验 ASAR 文件、目录、链接节点的元数据，避免畸形节点变成伪空文件。 | [#1364](https://github.com/storytold/craft-anything/pull/1364) | Open |
| 3 | 验证 gzip 可选头校验和，并兼容合法的 OS/XFL 信息字段。 | [#1371](https://github.com/storytold/craft-anything/pull/1371) | Open |
| 4 | 完整读取 gzip 串联成员，逐一验证 CRC/ISIZE，并共享解压输出预算。 | [#1372](https://github.com/storytold/craft-anything/pull/1372) | Open |
| 5 | 增加 ZIP 的 bzip2/XZ 方法支持，继续校验大小、CRC 和解压预算。 | [#1374](https://github.com/storytold/craft-anything/pull/1374) | Open |
| 6 | 增加 ZIP LZMA 方法支持，验证 framing、结束标记及输出预算。 | [#1375](https://github.com/storytold/craft-anything/pull/1375) | Open |
| 7 | 在增长 LZMA 字典前检查声明大小与内存预算。 | [#1381](https://github.com/storytold/craft-anything/pull/1381) | Open |
| 8 | 保持 GNU tar 长名称和链接的完整身份，避免截断后发生名称混淆。 | [#1362](https://github.com/storytold/craft-anything/pull/1362) | **Merged** |
| 9 | 识别 GNU sparse tar 条目，避免把稀疏载荷误当普通文件解出。 | [#1382](https://github.com/storytold/craft-anything/pull/1382) | Open |
| 10 | 支持串联 XZ 流和合法填充，并统一限制输出、校验索引。 | [#1383](https://github.com/storytold/craft-anything/pull/1383) | Open |

## craft-anything：原生二进制格式（10）

[完整验证、去重与提交材料](https://github.com/Afloat16/craft-anything/blob/docs/r3.12-native-contribution-delivery-20261109/contribution-delivery/2026-11-09-native/README.md)

| 项 | 实际改进 | 上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 1 | 为同名导入保留各自所属库的槽位，保留解析器已确定的槽。 | [#1365](https://github.com/storytold/craft-anything/pull/1365) | **Merged** |
| 2 | 按原始字节推进 ELF core 的文件路径游标，避免乱码或预览截断使后续路径错位。 | [#1366](https://github.com/storytold/craft-anything/pull/1366) | **Merged** |
| 3 | 在仅保留部分 ELF 节的文件中，通过动态段恢复缺失的导入和导出。 | [#1367](https://github.com/storytold/craft-anything/pull/1367) | **Merged** |
| 4 | 将 ELF 符号版本读取限制在声明的节范围内。 | [#1368](https://github.com/storytold/craft-anything/pull/1368) | **Merged** |
| 5 | 限制 PE 普通、延迟和 bound import 目录读取范围，报告不完整记录。 | [#1369](https://github.com/storytold/craft-anything/pull/1369) | Open |
| 6 | 校验 PE RVA 与 image base 的地址加法，避免虚拟地址回绕。 | [#1370](https://github.com/storytold/craft-anything/pull/1370) | **Merged** |
| 7 | 分别限制 PE 导出表扫描量和输出量，覆盖别名及空函数槽。 | [#1384](https://github.com/storytold/craft-anything/pull/1384) | Open |
| 8 | 按 Mach-O CPU 和完整线程状态记录提取入口点。 | [#1385](https://github.com/storytold/craft-anything/pull/1385) | Open |
| 9 | 对整份 Mach-O 的所有间接导入节使用共享扫描预算。 | [#1386](https://github.com/storytold/craft-anything/pull/1386) | Open |
| 10 | 校验 Objective-C 方法记录步长和完整字节范围。 | [#1387](https://github.com/storytold/craft-anything/pull/1387) | Open |

## craft-anything：其他格式与纹理（10）

[完整验证、去重与提交材料](https://github.com/Afloat16/craft-anything/blob/contribution-records/formats-other-2026-11-09/contribution-records/formats-other-2026-11-09/README.md)

| 项 | 实际改进 | 上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 1 | 拒绝超出 Java 常量池声明槽位的 Long/Double，避免最大索引溢出。 | [#1373](https://github.com/storytold/craft-anything/pull/1373) | Open |
| 2 | 禁止嵌入式 Godot PCK 的目录或成员借用尾部 trailer 字节。 | [#1379](https://github.com/storytold/craft-anything/pull/1379) | Open |
| 3 | 约束 Node SEA 资产、参数和解码文本的累计保留预算。 | [#1377](https://github.com/storytold/craft-anything/pull/1377) | **Merged** |
| 4 | 按实际 UTF-8 输出字节限制 IL2CPP 字面量，保留字符边界。 | [#1380](https://github.com/storytold/craft-anything/pull/1380) | Open |
| 5 | 支持 Unity R16/RG16 纹理解码，保留行方向和像素预算。 | [#1378](https://github.com/storytold/craft-anything/pull/1378) | **Merged** |
| 6 | DEX 成员或异常处理表达到上限时保留游标边界，避免伪造后续记录。 | [#1388](https://github.com/storytold/craft-anything/pull/1388) | Open |
| 7 | 确保 Android ARSC 子块位于其父块范围内。 | [#1389](https://github.com/storytold/craft-anything/pull/1389) | Open |
| 8 | 对 WebAssembly 重复自定义节的名称和 producer 元数据使用累计预算。 | [#1390](https://github.com/storytold/craft-anything/pull/1390) | Open |
| 9 | 读取 Unity 序列化元数据前验证其范围，避免越界或吞入对象数据。 | [#1391](https://github.com/storytold/craft-anything/pull/1391) | Open |
| 10 | 支持 Unreal 半精度和全精度浮点纹理导出，并正确处理 RGB/alpha。 | [#1392](https://github.com/storytold/craft-anything/pull/1392) | Open |

## agent-browser（10）

[完整验证、去重与提交材料](https://github.com/Afloat16/agent-browser/blob/submission-materials/dashboard-20261109/contributions/dashboard-20261109/README.md)

| 项 | 实际改进 | 上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 1 | 清空仪表盘日志后，新事件不会把旧日志恢复出来。 | [#2495](https://github.com/vercel-labs/agent-browser/pull/2495) | Open |
| 2 | 会话更换端口后重新加载活动历史。 | [#2496](https://github.com/vercel-labs/agent-browser/pull/2496) | Open |
| 3 | 将畸形命令响应显示为错误，避免误报执行成功。 | [#2497](https://github.com/vercel-labs/agent-browser/pull/2497) | Open |
| 4 | 从命令响应 envelope 中正确读取浏览器 storage 数据。 | [#2498](https://github.com/vercel-labs/agent-browser/pull/2498) | Open |
| 5 | 阻止旧 storage 请求覆盖当前会话的数据。 | [#2499](https://github.com/vercel-labs/agent-browser/pull/2499) | Open |
| 6 | 关闭会话失败后恢复按钮和重试能力。 | [#2500](https://github.com/vercel-labs/agent-browser/pull/2500) | Open |
| 7 | 将网络响应详情绑定到当前选择的请求，避免交叉显示。 | [#2501](https://github.com/vercel-labs/agent-browser/pull/2501) | Open |
| 8 | 避免重叠的会话轮询，并在卸载时取消未完成请求。 | [#2502](https://github.com/vercel-labs/agent-browser/pull/2502) | Open |
| 9 | 丢弃过期视频帧，及时释放已解码的 ImageBitmap。 | [#2503](https://github.com/vercel-labs/agent-browser/pull/2503) | Open |
| 10 | 浏览器 storage 不可用时保持仪表盘可用。 | [#2504](https://github.com/vercel-labs/agent-browser/pull/2504) | Open |

## billion-context（10）

[完整验证、去重与提交材料](https://github.com/Afloat16/billion-context/blob/2026-11-09_contribution-delivery/contribution-delivery/2026-11-09/README.md)

| 项 | 实际改进 | 上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 1 | 消除 SimHash 投票计数溢出，减少重复文本之间的错误碰撞。 | [#6046](https://github.com/ranxianglei/billion-context/pull/6046) | Open |
| 2 | 拒绝损坏的位置型相似度快照，防止证据错配到其他消息。 | [#6047](https://github.com/ranxianglei/billion-context/pull/6047) | Open |
| 3 | 迭代统计深层 JSON 媒体字节，避免递归栈溢出。 | [#6048](https://github.com/ranxianglei/billion-context/pull/6048) | Open |
| 4 | 健康检查响应体超时时保留 busy 状态，避免误判服务死亡。 | [#6049](https://github.com/ranxianglei/billion-context/pull/6049) | Open |
| 5 | GC 删除失败时继续计入保留字节，维持真实存储预算。 | [#6050](https://github.com/ranxianglei/billion-context/pull/6050) | Open |
| 6 | 客户端断开后取消闲置的上游流读取并清理监听器。 | [#6051](https://github.com/ranxianglei/billion-context/pull/6051) | Open |
| 7 | SSE 转储遵守背压，并等待文件完成或传播失败。 | [#6052](https://github.com/ranxianglei/billion-context/pull/6052) | Open |
| 8 | 调度前校验 attach 时间戳，并撤销失效或缺失观测的旧闹钟。 | [#6053](https://github.com/ranxianglei/billion-context/pull/6053) | Open |
| 9 | 水位缓存达到容量时仅逐出最旧会话，保留其他握手状态。 | [#6054](https://github.com/ranxianglei/billion-context/pull/6054) | Open |
| 10 | 身份回填兼容 JSON null、标量和数组，避免 SQLite 迁移中断。 | [#6055](https://github.com/ranxianglei/billion-context/pull/6055) | Open |

## OpenMausBot（10）

[完整验证、去重与提交材料](https://github.com/Afloat16/OpenMausBot/blob/contribution-records/2026-11-09/contribution-records/openmausbot-2026-11-09.md)

| 项 | 实际改进 | 上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 1 | 释放重试退避计时器和 abort 监听器，避免长期积累。 | [#5083](https://github.com/milind-soni/OpenMausBot/pull/5083) | Open |
| 2 | 自动化任务正在运行时保留之前的失败历史。 | [#5084](https://github.com/milind-soni/OpenMausBot/pull/5084) | Open |
| 3 | 保留不能安全转换的连接器数字参数，避免精度丢失。 | [#5085](https://github.com/milind-soni/OpenMausBot/pull/5085) | Open |
| 4 | 在 CRLF 跨网络片段时保持 MCP SSE 消息边界。 | [#5086](https://github.com/milind-soni/OpenMausBot/pull/5086) | Open |
| 5 | 严格校验新 TOTP 密钥的 Base32 分组，并兼容历史保存的密钥。 | [#5087](https://github.com/milind-soni/OpenMausBot/pull/5087) | Open |
| 6 | 从解析后的 Codex 配置识别 MCP 名称冲突，保留各挂载和权限边界。 | [#5088](https://github.com/milind-soni/OpenMausBot/pull/5088) | Open |
| 7 | 在线程检查器保留预算耗尽事件及有效交接路径。 | [#5089](https://github.com/milind-soni/OpenMausBot/pull/5089) | Open |
| 8 | 按 Unicode 边界拆分无空格语音，兼顾标点和组合字符。 | [#5090](https://github.com/milind-soni/OpenMausBot/pull/5090) | Open |
| 9 | 拒绝日期自动进位形成的错误日历日期。 | [#5091](https://github.com/milind-soni/OpenMausBot/pull/5091) | Open |
| 10 | 按请求 ID 匹配 MCP 响应，避免缓存错位工具列表并保留错误诊断。 | [#5092](https://github.com/milind-soni/OpenMausBot/pull/5092) | Open |

## claude-mem（10）

[完整验证、去重与提交材料](https://github.com/Afloat16/claude-mem/blob/submission-materials/seventy-improvements-20261109/contributions/2026-11-09/claude-mem.md)

| 项 | 实际改进 | 上游 PR | 当前状态 |
| ---: | --- | --- | --- |
| 1 | 遍历深层发布结果时避免递归栈溢出，并终止循环对象遍历。 | [#5579](https://github.com/thedotmack/claude-mem/pull/5579) | Open |
| 2 | 按原始活动时间排序工作列表，避免迟到导入把旧工作置顶。 | [#5580](https://github.com/thedotmack/claude-mem/pull/5580) | Open |
| 3 | 保留已保存规则的空证据，避免恢复被明确清空的旧引用。 | [#5581](https://github.com/thedotmack/claude-mem/pull/5581) | Open |
| 4 | 使用独立临时文件原子写入账本，处理并发和失败清理。 | [#5582](https://github.com/thedotmack/claude-mem/pull/5582) | Open |
| 5 | 将多行标题保留在同一 Markdown 表格行中，覆盖搜索与时间线。 | [#5583](https://github.com/thedotmack/claude-mem/pull/5583) | Open |
| 6 | 在生成产物名称前过滤非法文件项，保留有效文件的原始索引。 | [#5585](https://github.com/thedotmack/claude-mem/pull/5585) | Open |
| 7 | 用 Set/Map 避免文件历史排名中的重复线性扫描。 | [#5586](https://github.com/thedotmack/claude-mem/pull/5586) | Open |
| 8 | 会话迁移或忽略后清理旧分组的失效证据链接。 | [#5587](https://github.com/thedotmack/claude-mem/pull/5587) | Open |
| 9 | 分批读取候选历史，避免 SQLite 参数上限，并及时释放语句。 | [#5588](https://github.com/thedotmack/claude-mem/pull/5588) | Open |
| 10 | 按事件时间重放目标更新，避免迟到旧记录覆盖当前状态。 | [#5589](https://github.com/thedotmack/claude-mem/pull/5589) | Open |

## 验证状态说明

- craft-anything：每项均有实际格式回归及格式化、Clippy、层级、锁文件、敏感信息和 WebAssembly 门禁记录。新反馈的补修另记验证结果；合并后必要的补修不会增加主体改进计数。
- agent-browser：10 个精确源码提交的定向回归与 dashboard 生产构建通过。上游执行、部署或签名门禁依项目权限而定。
- OpenMausBot：10 个初始源码头通过完整项目类型检查和相关 Vitest。5 个收到兼容性反馈的 PR 正在更新及复验，当前报告不会沿用旧头结论冒充新头结果。
- billion-context：10 项定向测试、类型检查和构建通过。SimHash 的官方存储快照已重新生成；精确新头 36 项相关测试和构建通过。上游完整矩阵独立记录。
- claude-mem：10 个当前源码头的 Windows 及主构建/测试任务通过。5 个 PR 的独立数据库集成任务出现失败，正在对原始基线及当前头运行相同任务；主任务成功不等于全部 CI 成功。

完整机器可读索引：[manifest.json](manifest.json)。claude-mem 的逐项 CI 记录：[claude-mem.md](claude-mem.md)。
