/**
 * rehype Mermaid 容器插件
 * 把 remark 阶段生成的 .mermaid-container 节点替换为 .mermaid-diagram-container，
 * 内部包含图表占位节点与一份内联的客户端渲染脚本（以 ?raw 方式读取）。
 */
import { h } from "hastscript";
import { visit } from "unist-util-visit";

import mermaidRenderScript from "./mermaid-render-script.js?raw";

/** 返回 rehype transformer，重建 mermaid 容器并附带渲染脚本 */
export function rehypeMermaid() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (
				node.tagName === "div" &&
				node.properties &&
				node.properties.className &&
				node.properties.className.includes("mermaid-container")
			) {
				const mermaidCode = node.properties["data-mermaid-code"] || "";
				// 随机后缀保证同一页面多个图表的容器 id 不重复
				const mermaidId = `mermaid-${Math.random().toString(36).slice(-6)}`;

				// 创建 Mermaid 容器
				const mermaidContainer = h(
					"div",
					{
						class: "mermaid-wrapper",
						id: mermaidId,
					},
					[
						h(
							"div",
							{
								class: "mermaid",
								"data-mermaid-code": mermaidCode,
							},
							mermaidCode,
						),
					],
				);

				// 创建客户端渲染脚本
				const renderScript = h(
					"script",
					{
						type: "text/javascript",
					},
					mermaidRenderScript,
				);

				// 替换原始节点
				node.tagName = "div";
				node.properties = { class: "mermaid-diagram-container" };
				node.children = [mermaidContainer, renderScript];
			}
		});
	};
}
