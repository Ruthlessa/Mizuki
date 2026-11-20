/**
 * remark-directive 转 hast 插件
 * 把 directive 语法（:name[content]{attrs} / ::name 等）解析出的节点，通过 h() 计算成
 * hName/hProperties，交给 rehype 阶段渲染为真实元素。
 */
import { h } from "hastscript";
import { visit } from "unist-util-visit";

/** 返回 transformer：为所有 directive 节点补齐 hast 的标签名与属性 */
export function parseDirectiveNode() {
	return (tree, { _data }) => {
		visit(tree, (node) => {
			if (
				node.type === "containerDirective" ||
				node.type === "leafDirective" ||
				node.type === "textDirective"
			) {
				// biome-ignore lint/suspicious/noAssignInExpressions: <check later>
				const data = node.data || (node.data = {});
				node.attributes = node.attributes || {};
				if (
					node.children.length > 0 &&
					node.children[0].data &&
					node.children[0].data.directiveLabel
				) {
					// Add a flag to the node to indicate that it has a directive label
					node.attributes["has-directive-label"] = true;
				}
				const hast = h(node.name, node.attributes);

				data.hName = hast.tagName;
				data.hProperties = hast.properties;
			}
		});
	};
}
