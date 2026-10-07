import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

// 兼容国产浏览器 / 旧安卓内核（Chromium 61~90）：rolldown-vite 的 build.target
// 不会真正降级可选链 ?.、空值合并 ?? 等语法，需在生成 chunk 后统一降级，
// 否则这些内核解析脚本失败，表现为交互失效、切换页面后空白。
// esbuild 是 Astro 的传递依赖，这里通过 Astro 的依赖树解析，避免新增依赖。
const require = createRequire(import.meta.url);
const esbuild = require(
	require.resolve("esbuild", {
		paths: [dirname(require.resolve("astro/package.json"))],
	}),
);

function legacySyntaxDownlevel() {
	return {
		name: "legacy-syntax-downlevel",
		enforce: "post",
		order: "post",
		generateBundle(_options, bundle) {
			const lower = (code) =>
				esbuild.transformSync(code, {
					target: "es2017",
					// 目标 es2017 时 esbuild 会把 import.meta 替换成空对象 {}，
					// 这会破坏 Astro 的 preload-helper（import.meta.url 变成 undefined，
					// new URL 抛错导致面板管理器初始化失败）。声明支持后原样保留。
					supported: { "import-meta": true },
					legalComments: "none",
				}).code;
			for (const file of Object.values(bundle)) {
				if (file.type === "chunk" && file.fileName.endsWith(".js")) {
					file.code = lower(file.code);
				} else if (
					// 部分集成（如 astro-expressive-code）以 asset 形式直接
					// 输出脚本，也需要一并降级
					file.type === "asset" &&
					file.fileName.endsWith(".js") &&
					typeof file.source === "string"
				) {
					file.source = lower(file.source);
				}
			}
		},
	};
}

// Astro 的 is:inline 脚本会原样写入 HTML，不经过打包器，
// 因此上面的 chunk 降级无法覆盖它们，这里在构建产物落盘后统一处理。
const INLINE_SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function legacyInlineScripts() {
	return {
		name: "legacy-inline-scripts",
		hooks: {
			"astro:build:done": ({ dir }) => {
				const root = fileURLToPath(dir);
				const htmlFiles = [];
				const walk = (current) => {
					for (const entry of readdirSync(current, {
						withFileTypes: true,
					})) {
						const full = join(current, entry.name);
						if (entry.isDirectory()) walk(full);
						else if (entry.name.endsWith(".html")) htmlFiles.push(full);
					}
				};
				walk(root);

				for (const file of htmlFiles) {
					const html = readFileSync(file, "utf8");
					const lowered = html.replace(
						INLINE_SCRIPT_RE,
						(full, attrs, body) => {
							if (/\bsrc\s*=/i.test(attrs)) return full;
							const type = attrs.match(
								/\btype\s*=\s*["']?([^"'\s>]+)/i,
							)?.[1];
							if (
								type &&
								!/^(module|text\/javascript|application\/javascript)$/i.test(
									type,
								)
							) {
								return full;
							}
							// 只降级包含新语法的脚本，避免无谓改动其他内联脚本
							if (!/\?\.|\?\?/.test(body)) return full;
							try {
								const { code } = esbuild.transformSync(body, {
									target: "es2017",
									minify: true,
									legalComments: "none",
								});
								return `<script${attrs}>${code}</script>`;
							} catch {
								return full;
							}
						},
					);
					if (lowered !== html) writeFileSync(file, lowered);
				}
			},
		},
	};
}

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
	server: {
		host: '0.0.0.0',
		port: 3000,
		proxy: isLocal ? {
			'/admin': {
				target: 'http://localhost:3001',
				changeOrigin: true,
			},
		} : undefined,
	},

	integrations: [
		legacyInlineScripts(),
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
		plugins: [tailwindcss(), legacySyntaxDownlevel()],
		server: {
			host: '0.0.0.0',
			port: 3000,
			watch: {
				ignored: ['**/node_modules/**', '**/.pnpm-store/**'],
			},
		},
		build: {
			rollback: true,
			assetsInlineLimit: 4096,
			cssCodeSplit: true,
			cssMinify: "esbuild",
			inlineStylesheets: "auto",
			minify: "esbuild",
			chunkSizeWarningLimit: 500,
			sourcemap: false,
			reportCompressedSize: false,
			target: "es2017",
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
					manualChunks: (id) => {
						if (id.includes("node_modules")) {
							if (id.includes("astro")) return "astro-vendor";
							if (id.includes("svelte")) return "svelte-vendor";
							if (id.includes("swup")) return "ui-vendor";
							if (id.includes("expressive-code")) return "code-vendor";
							if (id.includes("iconify")) return "icon-vendor";
							if (id.includes("katex")) return "katex";
							if (id.includes("fontsource")) return "fontsource";
							return "vendor";
						}
					},
					chunkFileNames: "assets/chunks/[name]-[hash].js",
					entryFileNames: "assets/entry/[name]-[hash].js",
					assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
					compact: true,
					hoistTransitiveImports: true,
					preserveModules: false,
				},
				treeshake: {
					unknownGlobalSideEffects: false,
					preset: "smallest",
					moduleSideEffects: false,
				},
			},
		},
		esbuildOptions: {
			drop:
				process.env.NODE_ENV === "production"
					? ["console", "debugger"]
					: [],
			minify: true,
			treeShaking: true,
			legalComments: "none",
		},
		optimizeDeps: {
			include: [
				"astro-icon",
				"astro-expressive-code",
				"@swup/astro",
				"axios",
			],
			exclude: [
				"@astrojs/svelte",
			],
		},
		resolve: {
			tsconfigPaths: true
		}
	},
});
