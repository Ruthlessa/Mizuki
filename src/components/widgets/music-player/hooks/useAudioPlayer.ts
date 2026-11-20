// 音频播放核心状态与行为：播放/暂停、静音、加载结果处理与自动播放降级。
// 所有函数直接修改传入的 state 对象，音频元素由调用方传入以避免重复创建。
import { DEFAULT_SONG } from "../constants";
import type { Song } from "../types";

export interface AudioPlayerState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isLoading: boolean;
	currentSong: Song;
	autoplayFailed: boolean;
	willAutoPlay: boolean;
}

/** 创建音频播放器初始状态，默认曲目为占位歌曲。 */
export function createAudioPlayerState(): AudioPlayerState {
	return {
		isPlaying: false,
		currentTime: 0,
		duration: 0,
		volume: 0.7,
		isMuted: false,
		isLoading: false,
		currentSong: DEFAULT_SONG,
		autoplayFailed: false,
		willAutoPlay: false,
	};
}

/** 切换播放/暂停；无音频元素或无有效歌曲地址时直接返回。 */
export function togglePlay(
	state: AudioPlayerState,
	audio: HTMLAudioElement | undefined,
) {
	if (!audio || !state.currentSong.url) {
		return;
	}
	if (state.isPlaying) {
		audio.pause();
	} else {
		audio.play().catch(() => {});
	}
}

/** 切换静音标记（实际音量由 UI 层同步到 audio 元素）。 */
export function toggleMute(state: AudioPlayerState) {
	state.isMuted = !state.isMuted;
}

/** 音频元数据加载完成后同步时长，并按需尝试自动播放；被拦截时标记失败等待交互。 */
export function handleLoadSuccess(
	state: AudioPlayerState,
	audio: HTMLAudioElement | undefined,
) {
	state.isLoading = false;
	if (audio?.duration && audio.duration > 1) {
		state.duration = Math.floor(audio.duration);
		state.currentSong = { ...state.currentSong, duration: state.duration };
	}

	if (state.willAutoPlay || state.isPlaying) {
		const playPromise = audio?.play();
		if (playPromise !== undefined) {
			playPromise.catch((error) => {
				console.warn("自动播放被拦截，等待用户交互:", error);
				state.autoplayFailed = true;
				state.isPlaying = false;
			});
		}
	}
}

/** 处理加载失败：无地址时终止，否则返回是否应继续（原处于播放/待播放状态）。 */
export function handleLoadError(state: AudioPlayerState): {
	shouldContinue: boolean;
} {
	if (!state.currentSong.url) {
		return { shouldContinue: false };
	}
	state.isLoading = false;
	return { shouldContinue: state.isPlaying || state.willAutoPlay };
}

/** 装载新歌曲并记录是否需要自动播放；地址相同时不重复触发加载。 */
export function loadSong(state: AudioPlayerState, song: Song, autoPlay = true) {
	if (!song) {
		return;
	}
	if (song.url !== state.currentSong.url) {
		state.currentSong = { ...song };
		if (song.url) {
			state.isLoading = true;
		} else {
			state.isLoading = false;
		}
	}
	state.willAutoPlay = autoPlay;
}

/** 用户首次交互后补播此前被拦截的歌曲，成功则清除自动播放失败标记。 */
export function handleUserInteraction(
	state: AudioPlayerState,
	audio: HTMLAudioElement | undefined,
) {
	if (state.autoplayFailed && audio) {
		const playPromise = audio.play();
		if (playPromise !== undefined) {
			playPromise
				.then(() => {
					state.autoplayFailed = false;
				})
				.catch(() => {});
		}
	}
}
