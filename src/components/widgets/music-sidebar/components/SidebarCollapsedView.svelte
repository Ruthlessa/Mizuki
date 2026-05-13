<script lang="ts">
	import Icon from "@iconify/svelte";

	interface Props {
		isPlaying: boolean;
		isLoading: boolean;
		onExpand: () => void;
	}

	const { isPlaying, isLoading, onExpand }: Props = $props();
</script>

<button
	class="collapsed-view"
	onclick={onExpand}
	aria-label="展开音乐播放器"
>
	<span class="icon-wrapper">
		{#if isLoading}
			<Icon icon="eos-icons:loading" class="text-lg" />
		{:else if isPlaying}
			<Icon icon="material-symbols:music-note" class="text-lg" />
		{:else}
			<Icon icon="material-symbols:music-note" class="text-lg" />
		{/if}
	</span>
</button>

<style>
	.collapsed-view {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.5rem;
		background: var(--btn-regular-bg);
		transition: background 150ms ease;
	}

	.collapsed-view:hover {
		background: var(--btn-regular-bg-hover);
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--primary);
	}

	@media (max-width: 520px) {
		.collapsed-view {
			width: 2.25rem;
			height: 2.25rem;
		}
	}
</style>
