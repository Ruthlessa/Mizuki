// 播放列表核心逻辑：Meting 数据转换、随机/循环切换、上下曲与本地歌单加载。
// 以纯函数方式操作传入的 PlaylistState，便于 UI 层直接触发。
import Key from "../../../../i18n/i18nKey";
import { i18n } from "../../../../i18n/translation";
import { LOCAL_PLAYLIST } from "../constants";
import type { RepeatMode, Song } from "../types";

/**
 * Meting API song response structure
 * Based on https://github.com/metowolf/MetingJS
 */
interface MetingSong {
	id?: number | string;
	name?: string;
	title?: string;
	artist?: string;
	author?: string;
	duration?: number | string;
	pic?: string;
	url?: string;
}

/**
 * Convert Meting API song to internal Song type
 */
function convertMetingSong(song: MetingSong): Song {
	const title = song.name ?? song.title ?? i18n(Key.unknownSong);
	const artist = song.artist ?? song.author ?? i18n(Key.unknownArtist);
	let dur = song.duration ?? 0;
	if (typeof dur === "string") {
		dur = parseInt(dur, 10);
	}
	if (dur > 10000) {
		dur = Math.floor(dur / 1000);
	}
	if (!Number.isFinite(dur) || dur <= 0) {
		dur = 0;
	}

	return {
		id:
			typeof song.id === "string"
				? parseInt(song.id, 10)
				: (song.id ?? 0),
		title,
		artist,
		cover: song.pic ?? "",
		url: song.url ?? "",
		duration: dur,
	};
}

export interface PlaylistState {
	playlist: Song[];
	currentIndex: number;
	isShuffled: boolean;
	isRepeating: RepeatMode;
}

/** 创建播放列表初始状态。 */
export function createPlaylistState(): PlaylistState {
	return {
		playlist: [],
		currentIndex: 0,
		isShuffled: false,
		isRepeating: 0,
	};
}

/** 切换随机播放；开启时关闭循环模式，两者互斥。 */
export function toggleShuffle(state: PlaylistState) {
	state.isShuffled = !state.isShuffled;
	if (state.isShuffled) {
		state.isRepeating = 0;
	}
}

/** 在关闭/列表循环/单曲循环间轮转；非关闭态会关闭随机播放。 */
export function toggleRepeat(state: PlaylistState) {
	state.isRepeating = ((state.isRepeating + 1) % 3) as RepeatMode;
	if (state.isRepeating !== 0) {
		state.isShuffled = false;
	}
}

/** 计算上一首索引，到头部时回绕到末尾；单曲列表时保持当前索引。 */
export function previousSong(state: PlaylistState): number {
	if (state.playlist.length <= 1) {
		return state.currentIndex;
	}
	return state.currentIndex > 0
		? state.currentIndex - 1
		: state.playlist.length - 1;
}

/** 计算下一首索引：随机模式避免与当前重复，顺序模式到尾部回绕到 0。 */
export function nextSong(state: PlaylistState, _autoPlay = true): number {
	if (state.playlist.length <= 1) {
		return state.currentIndex;
	}

	let newIndex: number;
	if (state.isShuffled) {
		do {
			newIndex = Math.floor(Math.random() * state.playlist.length);
		} while (newIndex === state.currentIndex && state.playlist.length > 1);
	} else {
		newIndex =
			state.currentIndex < state.playlist.length - 1
				? state.currentIndex + 1
				: 0;
	}
	return newIndex;
}

/** 切换到指定索引的歌曲；索引越界返回 false。 */
export function playSong(state: PlaylistState, index: number): boolean {
	if (index < 0 || index >= state.playlist.length) {
		return false;
	}
	state.currentIndex = index;
	return true;
}

/** 按模板拼接 Meting API 地址并拉取歌单，成功后写回 state；失败统一走错误回调。 */
export async function fetchMetingPlaylist(
	state: PlaylistState,
	meting_api: string,
	meting_server: string,
	meting_type: string,
	meting_id: string,
	onLoadStart: () => void,
	onLoadEnd: () => void,
	showError: (message: string) => void,
): Promise<void> {
	if (!meting_api || !meting_id) {
		return;
	}

	onLoadStart();
	const apiUrl = meting_api
		.replace(":server", meting_server)
		.replace(":type", meting_type)
		.replace(":id", meting_id)
		.replace(":auth", "")
		.replace(":r", Date.now().toString());

	try {
		const res = await fetch(apiUrl);
		if (!res.ok) {
			throw new Error("meting api error");
		}
		const list: MetingSong[] = await res.json();
		state.playlist = list.map(convertMetingSong);
		onLoadEnd();
	} catch (e) {
		showError(i18n(Key.musicPlayerErrorPlaylist));
		onLoadEnd();
	}
}

/** 用内置歌单覆盖当前列表；为空时上报错误并返回 false。 */
export function loadLocalPlaylist(
	state: PlaylistState,
	showError: (message: string) => void,
): boolean {
	state.playlist = [...LOCAL_PLAYLIST];
	if (state.playlist.length === 0) {
		showError("本地播放列表为空");
		return false;
	}
	return true;
}

/** 判断当前是否有可切换的下一首/上一首（多于一首才可切换）。 */
export function canSkip(state: PlaylistState): boolean {
	return state.playlist.length > 1;
}
