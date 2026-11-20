<script lang="ts">
	/**
	 * Local Icon component for Svelte
	 * Uses icons from @iconify-json packages installed locally - no CDN required
	 */
	interface Props {
		icon: string;
		class?: string;
	}

	const { icon, class: className = "" }: Props = $props();

	// 约束：仅支持 iconSetMap 中登记的本地图标集，未登记集合会静默降级为占位符，且必须在构建期可解析对应包。
	const [collection, name] = icon.includes(":")
		? icon.split(":")
		: ["mdi", icon];

	const iconSetMap: Record<string, string> = {
		"material-symbols": "@iconify-json/material-symbols",
		"material-symbols-outlined": "@iconify-json/material-symbols",
		mdi: "@iconify-json/mdi",
		"fa7-solid": "@iconify-json/fa7-solid",
		"fa7-regular": "@iconify-json/fa7-regular",
		"fa7-brands": "@iconify-json/fa7-brands",
		"simple-icons": "@iconify-json/simple-icons",
	};

	const packageName = iconSetMap[collection];
	let svgContent = "";

	/** 动态导入本地图标集的 JSON，按名称取出 SVG 内容；失败时仅告警并保留占位符 */
	async function loadIcon() {
		if (!packageName) {
			return;
		}

		try {
			const iconsData = await import(
				/* @vite-ignore */ `${packageName}/icons.json`
			);
			const icons = iconsData.icons || {};
			const iconData = icons[name];

			if (iconData) {
				const viewBox = iconData.viewBox || "0 0 24 24";
				const body = iconData.body;

				if (body) {
					svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="${className}">${body}</svg>`;
				}
			}
		} catch (e) {
			console.warn(`Failed to load icon ${icon} from ${packageName}:`, e);
		}
	}

	loadIcon();
</script>

{#if svgContent}
	{@html svgContent}
{:else}
	<span class={className}>●</span>
{/if}
