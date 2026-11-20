/**
 * remark Mermaid 插件
 * 在 Markdown 解析阶段把 ```mermaid 代码块改写成带 .mermaid-container 的 div 节点（代码存在 data-mermaid-code 上）。
 * 真正的图形渲染由客户端脚本完成，构建期只负责转换节点，避免 SSR 阶段依赖浏览器。
 */
import { visit } from "unist-util-visit";

/** 返回 remark transformer，遍历代码块并标记 mermaid 类型 */
export function remarkMermaid() {
	return (tree) => {
		visit(tree, "code", (node) => {
			if (node.lang === "mermaid") {
				// 将 mermaid 代码块转换为自定义节点类型
				node.type = "mermaid";
				node.data = {
					hName: "div",
					hProperties: {
						className: ["mermaid-container"],
						"data-mermaid-code": node.value,
					},
				};
			}
		});
	};
}
