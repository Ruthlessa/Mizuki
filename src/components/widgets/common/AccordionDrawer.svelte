<script lang="ts">
	// 手风琴抽屉：通过 grid-template-rows 过渡实现内容展开/收起动画，展开状态由 show 控制。
	interface Props {
		show: boolean;
		class?: string;
	}

	const { show, class: className = "" }: Props = $props();
</script>

<div class={`accordion-drawer ${className}`} class:open={show}>
	<div class="accordion-inner">
		<slot />
	</div>
</div>

<style>
	.accordion-drawer {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition:
			grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1),
			opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.accordion-drawer.open {
		grid-template-rows: 1fr;
		opacity: 1;
	}

	.accordion-inner {
		overflow: hidden;
		min-height: 0;
	}
</style>
