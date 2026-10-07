import cascadeLayers from "@csstools/postcss-cascade-layers";
import oklabFunction from "@csstools/postcss-oklab-function";
import colorMixFunction from "@csstools/postcss-color-mix-function";
import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import postcssNesting from "postcss-nesting";

// Tailwind v4 的调色板用 oklch(L C none) 表示无彩度灰阶（如 --color-neutral-900），
// csstools 的 oklab 插件无法解析 none 关键字，会原样保留导致旧内核丢色。
// 这里把颜色函数中的 none 通道归一化为 0（none 在换算时本就按 0 处理），
// 之后 oklab 插件即可生成 rgb 回退。
function normalizeNoneChannels() {
	return {
		postcssPlugin: "normalize-none-channels",
		Declaration(decl) {
			if (!decl.value || !decl.value.includes("none")) return;
			decl.value = decl.value.replace(
				/\b(oklch|oklab)\(([^()]*)\)/g,
				(_, fn, args) => `${fn}(${args.replace(/\bnone\b/g, "0")})`,
			);
		},
	};
}
normalizeNoneChannels.postcss = true;

// CSS 兼容性处理（目标浏览器见 .browserslistrc）：
// 1. cascade-layers：把 Tailwind v4 产出的 @layer 展平，否则旧内核（Chromium < 99）
//    会把 @layer 块整块丢弃，导致页面几乎无样式
// 2. oklab-function：为 oklch()/oklab() 颜色生成 rgb 回退
// 3. color-mix-function：为 color-mix() 生成回退
// 4. autoprefixer：补全厂商前缀
export default {
	plugins: [
		postcssImport,
		postcssNesting,
		normalizeNoneChannels,
		cascadeLayers,
		oklabFunction,
		colorMixFunction,
		autoprefixer,
	],
};
