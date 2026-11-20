<script lang="ts">
	// 进度控制（molecule）：把时间数据与交互回调透传给 ProgressBar，并承担外层间距样式。
	import ProgressBar from "../atoms/ProgressBar.svelte";

	interface Props {
		currentTime: number;
		duration: number;
		onProgressClick: (event: MouseEvent) => void;
		onProgressKeyDown: (event: KeyboardEvent) => void;
	}

	const { currentTime, duration, onProgressClick, onProgressKeyDown }: Props =
		$props();
</script>

<div class="progress-section mb-4">
	<ProgressBar
		{currentTime}
		{duration}
		onclick={onProgressClick}
		onkeydown={onProgressKeyDown}
	/>
</div>
