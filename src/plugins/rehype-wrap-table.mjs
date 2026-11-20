/**
 * rehype 表格包裹插件
 * 给每个 <table> 套一层 div.table-wrapper，便于在小屏下做横向滚动且不破坏表格语义。
 */
import { visit } from "unist-util-visit";

/** 返回 rehype transformer，原地替换 table 节点为包裹后的结构 */
export function rehypeWrapTable() {
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			if (node.tagName === "table" && parent) {
				// 创建包装器 div
				const wrapper = {
					type: "element",
					tagName: "div",
					properties: {
						className: ["table-wrapper"],
					},
					children: [node],
				};

				// 替换原始的 table 节点
				parent.children[index] = wrapper;
			}
		});
	};
}
