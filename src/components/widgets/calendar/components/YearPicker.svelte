<script lang="ts">
	// 年份选择面板：按统计范围生成可滚动年份网格，并自动滚动定位到当前年份。
	import { onMount } from "svelte";

	import type { CalendarStats } from "../types/calendar";

	interface Props {
		currentYear: number;
		stats: CalendarStats;
		onYearSelect: (year: number) => void;
	}

	const { currentYear, stats, onYearSelect }: Props = $props();

	let containerEl: HTMLDivElement;

	/** 依据统计的最小/最大年份生成年份列表。 */
	const years = $derived(() => {
		const result: number[] = [];
		for (let y = stats.minYear; y <= stats.maxYear; y++) {
			result.push(y);
		}
		return result;
	});

	/** 返回年份按钮的样式类，当前年份使用主色描边高亮。 */
	function getYearClass(year: number): string {
		const isCurrent = year === currentYear;
		let baseClass =
			"cursor-pointer rounded-lg flex flex-col items-center justify-center py-3 transition-all hover:bg-[var(--btn-plain-bg-hover)] relative border border-transparent";

		if (isCurrent) {
			baseClass +=
				" border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5";
		} else {
			baseClass += " text-neutral-700 dark:text-neutral-300";
		}

		return baseClass;
	}

	/** 延迟一帧后把当前年份滚动到容器中部，确保挂载后可定位。 */
	function scrollToCurrentYear() {
		setTimeout(() => {
			const el = containerEl?.querySelector(
				`[data-year="${currentYear}"]`,
			);
			if (el) {
				el.scrollIntoView({ block: "center", behavior: "smooth" });
			}
		}, 50);
	}

	onMount(() => {
		scrollToCurrentYear();
	});
</script>

<div
	bind:this={containerEl}
	class="w-full h-full p-2 grid grid-cols-4 gap-2 content-start overflow-y-auto custom-scrollbar"
>
	{#each years() as year (year)}
		{@const hasPost = stats.hasPostInYear[year]}
		<button
			type="button"
			class={getYearClass(year)}
			data-year={year}
			onclick={() => onYearSelect(year)}
		>
			<span class="text-sm font-bold">{year}</span>
			{#if hasPost}
				<span class="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1"
				></span>
			{:else}
				<span class="w-1.5 h-1.5 mt-1"></span>
			{/if}
		</button>
	{/each}
</div>
