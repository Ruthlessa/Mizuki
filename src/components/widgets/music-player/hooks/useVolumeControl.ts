// 音量控制逻辑：本地存储持久化、指针拖拽换算音量（rAF 节流）与键盘交互。
// 依赖 useAudioPlayer 的状态对象，拖拽结束后统一落盘。
import { STORAGE_KEY_VOLUME } from "../constants";
import type { AudioPlayerState } from "./useAudioPlayer";

export interface VolumeDragState {
	isVolumeDragging: boolean;
	isPointerDown: boolean;
	volumeBarRect: DOMRect | null;
	rafId: number | null;
}

/** 创建音量拖拽过程状态。 */
export function createVolumeDragState(): VolumeDragState {
	return {
		isVolumeDragging: false,
		isPointerDown: false,
		volumeBarRect: null,
		rafId: null,
	};
}

/** 从 localStorage 读取已保存音量；异常时静默降级为默认值。 */
export function loadVolumeFromStorage(state: AudioPlayerState) {
	try {
		if (typeof localStorage !== "undefined") {
			const savedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
			if (savedVolume !== null && !isNaN(parseFloat(savedVolume))) {
				state.volume = parseFloat(savedVolume);
			}
		}
	} catch (e) {
		console.warn("Failed to load volume settings from localStorage:", e);
	}
}

/** 将当前音量写回 localStorage，供下次访问恢复。 */
export function saveVolumeToStorage(state: AudioPlayerState) {
	try {
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(STORAGE_KEY_VOLUME, state.volume.toString());
		}
	} catch (e) {
		console.warn("Failed to save volume settings to localStorage:", e);
	}
}

/** 按指针横坐标在音量条中的比例换算音量，并夹紧到 0~1。 */
function updateVolumeLogic(
	clientX: number,
	dragState: VolumeDragState,
	volumeBar: HTMLElement | null,
	audio: HTMLAudioElement | undefined,
	audioPlayerState: AudioPlayerState,
) {
	if (!audio || !volumeBar) {
		return;
	}

	const rect = dragState.volumeBarRect || volumeBar.getBoundingClientRect();
	const percent = Math.max(
		0,
		Math.min(1, (clientX - rect.left) / rect.width),
	);
	audioPlayerState.volume = percent;
}

/** 开始拖拽音量：捕获指针并缓存音量条尺寸，立即按按下位置更新一次。 */
export function startVolumeDrag(
	event: PointerEvent,
	dragState: VolumeDragState,
	volumeBar: HTMLElement | null,
	audio: HTMLAudioElement | undefined,
	audioPlayerState: AudioPlayerState,
) {
	if (!volumeBar) {
		return;
	}
	event.preventDefault();

	dragState.isPointerDown = true;
	volumeBar.setPointerCapture(event.pointerId);

	dragState.volumeBarRect = volumeBar.getBoundingClientRect();
	updateVolumeLogic(
		event.clientX,
		dragState,
		volumeBar,
		audio,
		audioPlayerState,
	);
}

/** 拖拽移动时用 requestAnimationFrame 节流更新音量，避免高频重排。 */
export function handleVolumeMove(
	event: PointerEvent,
	dragState: VolumeDragState,
	volumeBar: HTMLElement | null,
	audio: HTMLAudioElement | undefined,
	audioPlayerState: AudioPlayerState,
) {
	if (!dragState.isPointerDown) {
		return;
	}
	event.preventDefault();

	dragState.isVolumeDragging = true;
	if (dragState.rafId) {
		return;
	}

	dragState.rafId = requestAnimationFrame(() => {
		updateVolumeLogic(
			event.clientX,
			dragState,
			volumeBar,
			audio,
			audioPlayerState,
		);
		dragState.rafId = null;
	});
}

/** 结束拖拽：释放指针捕获、取消未执行的 rAF 并持久化音量。 */
export function stopVolumeDrag(
	event: PointerEvent,
	dragState: VolumeDragState,
	volumeBar: HTMLElement | null,
	audioPlayerState: AudioPlayerState,
) {
	if (!dragState.isPointerDown) {
		return;
	}
	dragState.isPointerDown = false;
	dragState.isVolumeDragging = false;
	dragState.volumeBarRect = null;
	if (volumeBar) {
		volumeBar.releasePointerCapture(event.pointerId);
	}

	if (dragState.rafId) {
		cancelAnimationFrame(dragState.rafId);
		dragState.rafId = null;
	}

	saveVolumeToStorage(audioPlayerState);
}

/** 处理音量条键盘事件：Enter 切换静音，空格仅阻止页面滚动。 */
export function handleVolumeKeyDown(
	event: KeyboardEvent,
	onToggleMute: () => void,
) {
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		if (event.key === "Enter") {
			onToggleMute();
		}
	}
}
