/**
 * GitHub Alert 语法兼容插件
 * 把 GitHub 风格的引用块 `> [!NOTE]`（TIP/IMPORTANT/WARNING/CAUTION）改写为 remark-directive 的
 * containerDirective 节点，交由 admonition 组件统一渲染。
 */
import { visit } from "unist-util-visit";

// 匹配单独成行的 [!TYPE] 声明
const GITHUB_ALERT_DECLARATION_REGEX = /^\s*\[\!(?<type>\w+)\]\s*$/;
const GITHUB_ALERT_TYPES = ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"];

/** 解析一行文本是否为合法的 GitHub Alert 声明，返回大写类型或 null */
function parseGithubAlertDeclaration(text) {
	const match = text.match(GITHUB_ALERT_DECLARATION_REGEX);
	const type = match?.groups?.type?.toUpperCase();
	return GITHUB_ALERT_TYPES.includes(type) ? type : null;
}

/** 返回 remark transformer，把满足条件的第一段引用块替换为 directive 节点 */
export function remarkFixGithubAdmonitions() {
	return (tree) => {
		visit(tree, "blockquote", (node, index, parent) => {
			if (!parent || index === undefined) {
				return;
			}

			const firstChild = node.children[0];
			if (firstChild?.type !== "paragraph") {
				return;
			}

			const firstParagraphChild = firstChild.children[0];
			if (firstParagraphChild?.type !== "text") {
				return;
			}

			// 只允许声明独占引用块的首行，因此取第一行判断
			const possibleTypeDeclaration =
				firstParagraphChild.value.split("\n")[0];
			if (!possibleTypeDeclaration) {
				return;
			}

			const type = parseGithubAlertDeclaration(possibleTypeDeclaration);
			if (!type) {
				return;
			}

			const typeToDirectiveName = {
				NOTE: "note",
				TIP: "tip",
				IMPORTANT: "important",
				WARNING: "warning",
				CAUTION: "caution",
			};

			const directiveName = typeToDirectiveName[type];
			if (!directiveName) {
				return;
			}

			// 声明行之后若还有正文（同一段落内换行），需要保留为 directive 的内容
			const textNodeChildren =
				firstParagraphChild.value.split("\n").length > 1
					? [
							{
								type: "text",
								value: firstParagraphChild.value
									.split("\n")
									.slice(1)
									.join("\n"),
							},
						]
					: [];

			const paragraphChildren = [
				...textNodeChildren,
				...firstChild.children.slice(1),
			];

			const alertParagraphChildren =
				paragraphChildren.length > 0
					? [{ type: "paragraph", children: paragraphChildren }]
					: [];

			const directive = {
				type: "containerDirective",
				name: directiveName,
				children: [
					...alertParagraphChildren,
					...node.children.slice(1),
				],
			};

			parent.children[index] = directive;
		});
	};
}
