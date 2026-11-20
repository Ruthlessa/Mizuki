<script lang="ts">
	// 月份选择面板：以 3 列网格展示 12 个月，并标记当前月与有文章的月份。
	import type { CalendarStats } from "../types/calendar";

	interface Props {
		monthNames: string[];
		currentYear: number;
		currentMonth: number;
		stats: CalendarStats;
		onMonthSelect: (month: number) => void;
	}

	const {
		monthNames,
		currentYear,
		currentMonth,
		stats,
		onMonthSelect,
	}: Props = $props();

	/** 返回月份按钮的样式类，当前月使用主色描边高亮。 */
	function getMonthClass(index: number, hasPost: boolean): string {
		const isCurrentMonth = index === currentMonth;
		let baseClass =
			"cursor-pointer rounded-lg flex flex-col items-center justify-center p-2 transition-all hover:bg-[var(--btn-plain-bg-hover)] relative border border-transparent";

		if (isCurrentMonth) {
			baseClass +=
				" border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5";
		} else {
			baseClass += " text-neutral-700 dark:text-neutral-300";
		}

		return baseClass;
	}
</script>

<div class="w-full h-full p-4 grid grid-cols-3 gap-3 content-center">
	{#each monthNames as name, index}
		{@const hasPost = stats.hasPostInMonth[`${currentYear}-${index + 1}`]}
		<button
			type="button"
			class={getMonthClass(index, hasPost)}
			data-month={index}
			onclick={() => onMonthSelect(index)}
		>
			<span class="text-sm font-bold">{name}</span>
			{#if hasPost}
				<span class="w-1 h-1 rounded-full bg-[var(--primary)] mt-1"
				></span>
			{:else}
				<span class="w-1 h-1 mt-1"></span>
			{/if}
		</button>
	{/each}
</div>
