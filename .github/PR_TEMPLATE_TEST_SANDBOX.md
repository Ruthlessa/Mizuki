# PR 模板验证说明（测试专用，随时可删）

本文件仅用于验证 `.github/pull_request_template.md` 升级后新建 PR 时是否正确加载了以下结构：

1. YAML front-matter（name / about / title 示例）
2. 9 项「🔖 变更类型」（带 emoji）
3. 「🧾 变更摘要」+「🔗 相关链接」
4. 「⚠️ BREAKING CHANGE」区块
5. 9 项「✍️ 作者自检清单」（包括 Mizuki 专用项：Svelte 5 Runes / PC+移动端双端 / Conventional Commits）
6. 「🧪 测试说明」+ 4 环境矩阵
7. 「🖼️ 截图对比」表
8. 6 项「👀 审稿人审查清单」
9. 「📌 其他说明」

验证完后：**关闭 PR、删除分支、删除本文件**（不要合并到 master）。
