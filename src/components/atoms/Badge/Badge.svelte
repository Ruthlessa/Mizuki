<script lang="ts">
	// 徽标原子组件：渲染一个带主题配色的数值/文本标签，常用于导航菜单项右侧的计数提示。
	// 值为空（undefined / null / 空串）时整体不渲染，避免出现空胶囊。
	import type { BadgeProps } from "./types";

	interface Props extends BadgeProps {}
	const { value, class: className = "" }: Props = $props();
</script>

{#if value !== undefined && value !== null && value !== ""}
	<div class="badge {className}">
		{value}
	</div>
{/if}

<style>
	.badge {
		transition: all 0.2s ease;
		padding: 0 0.5rem;
		height: 1.75rem;
		min-width: 2rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--btn-content);
		background-color: var(--btn-regular-bg);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global(.dark) .badge {
		color: var(--deep-text);
		background-color: var(--primary);
	}
</style>
