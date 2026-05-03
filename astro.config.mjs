import sitemap from "@astrojs/sitemap";
import svelte, { vitePreprocess } from "@astrojs/svelte";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { umami } from "oddmisc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";

import { siteConfig } from "./src/config.ts";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { rehypeImageWidth } from "./src/plugins/rehype-image-width.mjs";
import { rehypeMermaid } from "./src/plugins/rehype-mermaid.mjs";
import { rehypeWrapTable } from "./src/plugins/rehype-wrap-table.mjs";
import { remarkContent } from "./src/plugins/remark-content.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkFixGithubAdmonitions } from "./src/plugins/remark-fix-github-admonitions.js";
import { remarkMermaid } from "./src/plugins/remark-mermaid.js";

// https://astro.build/config
const isVercel = !!process.env.VERCEL && process.env.VERCEL !== "";
const isGitHubPages = !!process.env.GITHUB_ACTIONS;
const isCloudflarePages = !!process.env.CF_PAGES;
const isLocal = !isVercel && !isGitHubPages && !isCloudflarePages;
export default defineConfig({
	site: isVercel
		? "https://www.nfq.dpdns.org/"
		: isCloudflarePages
			? "https://mizuki.pages.dev/"
			: siteConfig.siteURL,
	base: isGitHubPages ? "/Mizuki" : undefined, // 只有 GitHub Pages 需要 base 路径
	trailingSlash: "always",

	output: "static",

	integrations: [
		umami({
			shareUrl: false,
		}),
		swup({
			theme: false,
			animationClass: "transition-swup-",
			containers: ["main"],
			smoothScrolling: false, // 禁用平滑滚动以提升性能，避免与锚点导航冲突
			cache: true,
			preload: true, // 启用智能预加载
			preloadCondition: (linkEl) => {
				// 排除外部链接、PDF等资源
				if (linkEl.origin !== window.location.origin) {
					return false;
				}
				const href = linkEl.getAttribute("href") || "";
				const excludeExts = [".pdf", ".zip", ".tar", ".gz"];
				if (excludeExts.some((ext) => href.endsWith(ext))) {
					return false;
				}
				// 只预加载可见的链接（在视口内）
				const rect = linkEl.getBoundingClientRect();
				return rect.top < window.innerHeight * 2; // 提前两倍视口高度预加载
			},
			accessibility: true,
			updateHead: process.env.NODE_ENV === "production",
			updateBodyClass: false,
			globalInstance: true,
			// 滚动相关配置优化
			resolveUrl: (url) => url,
			animateHistoryBrowsing: false,
			skipPopStateHandling: (event) => {
				// 跳过锚点链接的处理，让浏览器原生处理
				return (
					event.state &&
					event.state.url &&
					event.state.url.includes("#")
				);
			},
		}),
		icon(),
		expressiveCode({
			themes: ["github-light", "github-dark"],
			plugins: [
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				pluginLanguageBadge(),
				pluginCustomCopyButton(),
			],
			defaultProps: {
				wrap: true,
				overridesByLang: {
					shellsession: { showLineNumbers: false },
					bash: { frame: "code" },
					shell: { frame: "code" },
					sh: { frame: "code" },
					zsh: { frame: "code" },
				},
			},
			styleOverrides: {
				codeBackground: "var(--codeblock-bg)",
				borderRadius: "0.75rem",
				borderColor: "none",
				codeFontSize: "0.875rem",
				codeFontFamily:
					"'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
				codeLineHeight: "1.5rem",
				frames: {
					editorBackground: "var(--codeblock-bg)",
					terminalBackground: "var(--codeblock-bg)",
					terminalTitlebarBackground: "var(--codeblock-bg)",
					editorTabBarBackground: "var(--codeblock-bg)",
					editorActiveTabBackground: "none",
					editorActiveTabIndicatorBottomColor: "var(--primary)",
					editorActiveTabIndicatorTopColor: "none",
					editorTabBarBorderBottomColor: "var(--codeblock-bg)",
					terminalTitlebarBorderBottomColor: "none",
				},
				textMarkers: {
					delHue: 0,
					insHue: 180,
					markHue: 250,
				},
			},
			frames: {
				showCopyToClipboardButton: false,
			},
		}),
		svelte({
			preprocess: vitePreprocess(),
		}),
		sitemap(),
	],
	markdown: {
		remarkPlugins: [
			remarkMath,
			remarkContent,
			remarkFixGithubAdmonitions,
			remarkDirective,
			remarkSectionize,
			parseDirectiveNode,
			remarkMermaid,
		],
		rehypePlugins: [
			rehypeKatex,
			[
				rehypeExternalLinks,
				{
					target: "_blank",
					rel: ["nofollow", "noopener", "noreferrer"],
				},
			],
			rehypeSlug,
			rehypeWrapTable,
			rehypeMermaid,
			[
				rehypeComponents,
				{
					components: {
						github: GithubCardComponent,
						note: (x, y) => AdmonitionComponent(x, y, "note"),
						tip: (x, y) => AdmonitionComponent(x, y, "tip"),
						important: (x, y) =>
							AdmonitionComponent(x, y, "important"),
						caution: (x, y) => AdmonitionComponent(x, y, "caution"),
						warning: (x, y) => AdmonitionComponent(x, y, "warning"),
					},
				},
			],
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: {
						className: ["anchor"],
					},
					content: {
						type: "element",
						tagName: "span",
						properties: {
							className: ["anchor-icon"],
							"data-pagefind-ignore": true,
						},
						children: [{ type: "text", value: "#" }],
					},
				},
			],
			rehypeImageWidth,
		],
	},
	vite: {
		plugins: [tailwindcss()],
		build: {
			// 静态资源处理优化，防止小图片转 base64 导致 HTML 体积过大
			assetsInlineLimit: 4096,
			// CSS 代码分割
			cssCodeSplit: true,
			cssMinify: "esbuild",
			// 内联小型 CSS 文件以减少网络请求
			inlineStylesheets: "auto",
			// 生产环境移除 console 和 debugger
			minify: "esbuild",
			// 进一步优化 chunk 大小
			chunkSizeWarningLimit: 1000,
			// 启用资源源映射用于生产环境调试
			sourcemap: false,
			// 优化 Rollup 输出
			reportCompressedSize: false, // 加快构建速度
			rollupOptions: {
				onwarn(warning, warn) {
					if (
						warning.message.includes(
							"is dynamically imported by",
						) &&
						warning.message.includes(
							"but also statically imported by",
						)
					) {
						return;
					}
					warn(warning);
				},
				output: {
					// 手动代码分割
					manualChunks: {
						"astro-vendor": [
							"astro",
							"astro-icon",
							"astro-expressive-code",
						],
						"ui-vendor": ["@swup/astro"],
					},
					// 优化 chunk 命名
					chunkFileNames: "assets/chunks/[name]-[hash].js",
					entryFileNames: "assets/entry/[name]-[hash].js",
					assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
				},
			},
		},
		// 生产环境移除 console.log 和 debugger
		esbuildOptions: {
			drop:
				process.env.NODE_ENV === "production"
					? ["console", "debugger"]
					: [],
			// 启用 JavaScript 压缩
			minify: true,
		},
		// 优化依赖预构建 - 改进的列表
		optimizeDeps: {
			include: [
				"astro-icon",
				"astro-expressive-code",
				"@swup/astro",
				"axios",
			],
			// 排除不需要预构建的依赖
			exclude: [
				"@astrojs/svelte",
			],
		},
	},
});
