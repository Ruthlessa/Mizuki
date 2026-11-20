/**
 * rehype 图片宽度插件
 * 支持在图片 alt 末尾写 ` w-80%` 之类的语法控制展示宽度：提取宽度、从 alt 中剥离该标记，
 * 并把图片包进 <figure>（有 title 时追加 <figcaption>）。
 * 仅处理同时具备 alt 的 img 节点。
 */
import { visit } from "unist-util-visit";

/** 返回 rehype transformer，按 alt 中的 w-xx% 标记重写图片节点 */
export function rehypeImageWidth() {
	// 只匹配一次且不带 g 标志，避免 replace 时反复消耗 lastIndex
	const regex = / w-([0-9]+)%/;

	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			if (
				node.tagName === "img" &&
				node.properties &&
				node.properties.alt
			) {
				const alt = node.properties.alt;
				const match = alt.match(regex);

				if (match) {
					const width = match[1];
					node.properties.alt = alt.replace(regex, "").trim();
					node.properties.style = `width: ${width}%; display: block; margin: 0 auto;`;
					// Remove width and height attributes if they were set by Astro optimization
					// 删掉 Astro 图片优化注入的宽高，否则会覆盖自定义百分比宽度
					delete node.properties.width;
					delete node.properties.height;

					const figureChildren = [node];

					if (node.properties.title) {
						const figcaption = {
							type: "element",
							tagName: "figcaption",
							properties: {
								style: "text-align: center; margin-top: 0.5em; font-size: 0.9em; color: #666;",
							},
							children: [
								{
									type: "text",
									value: node.properties.title,
								},
							],
						};
						figureChildren.push(figcaption);
					}

					const figure = {
						type: "element",
						tagName: "figure",
						properties: {
							style: "margin: 1em 0;",
						},
						children: figureChildren,
					};

					if (parent && index !== undefined) {
						parent.children[index] = figure;
					}
				}
			}
		});
	};
}
