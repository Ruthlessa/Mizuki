/**
 * 音乐播放器全局状态管理。
 * 以单例形式持有唯一的 HTMLAudioElement、歌单与 UI 状态（展开/隐藏/歌单列表），
 * 通过订阅机制广播变化，供 FAB 面板与侧边栏播放器共享。
 */
import Key from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

import {
	DEFAULT_SONG,
	LOCAL_PLAYLIST,
	SKIP_ERROR_DELAY,
	STORAGE_KEY_VOLUME,
} from "@/components/widgets/music-player/constants";
import type { RepeatMode, Song } from "@/components/widgets/music-player/types";
import { musicPlayerConfig } from "@/config";

export interface MusicPlayerState {
	currentSong: Song;
	playlist: Song[];
	currentIndex: number;
	isPlaying: boolean;
	isLoading: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isShuffled: boolean;
	isRepeating: RepeatMode;
	showPlaylist: boolean;
	errorMessage: string;
	showError: boolean;
	isExpanded: boolean;
	isHidden: boolean;
	autoplayFailed: boolean;
	willAutoPlay: boolean;
}

/** 把歌单中的相对路径补成站点绝对路径，外部 URL 原样返回 */
function getAssetPath(path: string): string {
	if (!path) {
		return "";
	}
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	if (path.startsWith("/")) {
		return path;
	}
	return `/${path}`;
}

/** 音乐播放器状态容器：管理 Audio 实例、歌单与 UI 状态 */
class MusicPlayerStore {
	private audio: HTMLAudioElement | null = null;
	private state: MusicPlayerState;
	private isInitialized = false;
	private unregisterInteraction: (() => void) | undefined;
	private listeners = new Set<(state: MusicPlayerState) => void>();

	/** 初始化内部状态；Audio 实例延迟到 initialize() 再创建 */
	constructor() {
		this.state = this.createInitialState();
	}

	/** 生成播放器的初始状态 */
	private createInitialState(): MusicPlayerState {
		return {
			currentSong: { ...DEFAULT_SONG },
			playlist: [],
			currentIndex: 0,
			isPlaying: false,
			isLoading: false,
			currentTime: 0,
			duration: 0,
			volume: 0.7,
			isMuted: false,
			isShuffled: false,
			isRepeating: 0,
			showPlaylist: false,
			errorMessage: "",
			showError: false,
			isExpanded: false,
			isHidden: false,
			autoplayFailed: false,
			willAutoPlay: false,
		};
	}

	/** 拷贝当前状态，避免订阅者拿到内部对象后直接修改 */
	private createSnapshot(): MusicPlayerState {
		return {
			...this.state,
			currentSong: { ...this.state.currentSong },
			playlist: this.state.playlist.map((song) => ({ ...song })),
		};
	}

	/** 获取当前状态快照 */
	getState(): MusicPlayerState {
		return this.createSnapshot();
	}

	/** 暴露底层 Audio 实例，供进度可视化等组件读取 */
	getAudio(): HTMLAudioElement | null {
		return this.audio;
	}

	/** 订阅状态变化：立即回调一次当前快照，返回取消订阅函数 */
	subscribe(listener: (state: MusicPlayerState) => void): () => void {
		this.listeners.add(listener);
		listener(this.createSnapshot());
		return () => {
			this.listeners.delete(listener);
		};
	}

	/** 幂等初始化：创建 Audio、恢复音量、注册交互补救并加载歌单 */
	async initialize(): Promise<void> {
		if (typeof window === "undefined" || this.isInitialized) {
			return;
		}
		this.isInitialized = true;

		if (!musicPlayerConfig.enable) {
			return;
		}

		this.audio = new Audio();
		// 只预取元数据（用于显示时长），完整音频流等用户点击播放再请求
		this.audio.preload = "metadata";
		this.setupAudioListeners();
		this.loadVolumeFromStorage();
		this.registerInteractionHandler();
		await this.loadPlaylist();
	}

	/** 绑定音频事件，把播放、进度、加载与错误同步到 store */
	private setupAudioListeners(): void {
		if (!this.audio) {
			return;
		}

		this.audio.volume = this.state.volume;
		this.audio.muted = this.state.isMuted;

		this.audio.addEventListener("play", () => {
			this.state.isPlaying = true;
			this.broadcastState();
		});

		this.audio.addEventListener("pause", () => {
			this.state.isPlaying = false;
			this.broadcastState();
		});

		this.audio.addEventListener("timeupdate", () => {
			if (this.audio) {
				this.state.currentTime = this.audio.currentTime;
				this.broadcastState();
			}
		});

		this.audio.addEventListener("ended", () => {
			this.handleAudioEnded();
		});

		this.audio.addEventListener("error", () => {
			this.handleAudioError();
		});

		this.audio.addEventListener("loadeddata", () => {
			this.handleAudioLoaded();
		});

		// 只预取元数据时，时长为 0 的歌也可以在 loadedmetadata 后显示正确总时长
		this.audio.addEventListener("loadedmetadata", () => {
			this.state.isLoading = false;
			if (this.audio?.duration && this.audio.duration > 1) {
				this.state.duration = Math.floor(this.audio.duration);
				this.state.currentSong = {
					...this.state.currentSong,
					duration: this.state.duration,
				};
				this.broadcastState();
			}
		});

		this.audio.addEventListener("loadstart", () => {
			this.state.isLoading = true;
			this.broadcastState();
		});
	}

	/** 单曲播放结束：单曲循环时重播，否则自动切到下一首 */
	private handleAudioEnded(): void {
		if (this.state.isRepeating === 1) {
			if (this.audio) {
				this.audio.currentTime = 0;
				this.audio.play().catch(() => {});
			}
		} else {
			this.next(true);
		}
	}

	/** 播放出错时提示用户；歌单多于一首时延时自动跳过 */
	private handleAudioError(): void {
		this.state.isLoading = false;
		this.showError(i18n(Key.musicPlayerErrorSong));

		if (this.state.playlist.length > 1) {
			setTimeout(() => this.next(true), SKIP_ERROR_DELAY);
		} else if (this.state.playlist.length <= 1) {
			this.showError(i18n(Key.musicPlayerErrorEmpty));
		}
		this.broadcastState();
	}

	/** 音频可播放后更新时长，并在需要自动播放时开始播放 */
	private handleAudioLoaded(): void {
		this.state.isLoading = false;
		if (this.audio?.duration && this.audio.duration > 1) {
			this.state.duration = Math.floor(this.audio.duration);
			this.state.currentSong = {
				...this.state.currentSong,
				duration: this.state.duration,
			};
		}

		if (this.state.willAutoPlay || this.state.isPlaying) {
			const playPromise = this.audio?.play();
			if (playPromise !== undefined) {
				playPromise.catch(() => {
					this.state.autoplayFailed = true;
					this.state.isPlaying = false;
				});
			}
		}
		this.broadcastState();
	}

	/** 从 localStorage 恢复上次的音量设置 */
	private loadVolumeFromStorage(): void {
		if (typeof localStorage !== "undefined") {
			const savedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
			if (savedVolume) {
				const volume = parseFloat(savedVolume);
				if (!isNaN(volume) && volume >= 0 && volume <= 1) {
					this.state.volume = volume;
					this.state.isMuted = volume === 0;
					if (this.audio) {
						this.audio.volume = volume;
						this.audio.muted = this.state.isMuted;
					}
				}
			}
		}
	}

	/** 注册一次性交互监听，用于补救浏览器阻止自动播放的场景 */
	private registerInteractionHandler(): void {
		if (typeof document === "undefined") {
			return;
		}
		const handler = () => {
			if (this.state.autoplayFailed && this.audio) {
				const playPromise = this.audio.play();
				if (playPromise !== undefined) {
					playPromise
						.then(() => {
							this.state.autoplayFailed = false;
						})
						.catch(() => {});
				}
			}
		};
		document.addEventListener("click", handler, { once: true });
		document.addEventListener("keydown", handler, { once: true });
		this.unregisterInteraction = () => {
			document.removeEventListener("click", handler);
			document.removeEventListener("keydown", handler);
		};
	}

	/** 依据配置选择 Meting 在线歌单或本地歌单 */
	private async loadPlaylist(): Promise<void> {
		const mode = musicPlayerConfig.mode ?? "meting";
		const meting_api =
			musicPlayerConfig.meting_api ??
			"https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r";
		const meting_id = musicPlayerConfig.id ?? "14164869977";
		const meting_server = musicPlayerConfig.server ?? "netease";
		const meting_type = musicPlayerConfig.type ?? "playlist";

		if (mode === "meting") {
			await this.fetchMetingPlaylist(
				meting_api,
				meting_server,
				meting_type,
				meting_id,
			);
		} else {
			this.loadLocalPlaylist();
		}
	}

	/** 请求 Meting 歌单并转换；接口异常时回退到本地歌单，保证播放器可用 */
	private async fetchMetingPlaylist(
		api: string,
		server: string,
		type: string,
		id: string,
	): Promise<void> {
		if (!api || !id) {
			return;
		}

		this.state.isLoading = true;
		this.broadcastState();

		const apiUrl = api
			.replace(":server", server)
			.replace(":type", type)
			.replace(":id", id)
			.replace(":auth", "")
			.replace(":r", Date.now().toString());

		try {
			const res = await fetch(apiUrl);
			if (!res.ok) {
				throw new Error("meting api error");
			}
			const list: any[] = await res.json();
			this.state.playlist = list.map((song) =>
				this.convertMetingSong(song),
			);
			this.state.isLoading = false;

			if (this.state.playlist.length > 0) {
				this.loadSong(this.state.playlist[0], false);
			}
		} catch (e) {
			// 第三方 Meting 服务不可用时退回本地歌单，避免播放器完全失效
			this.showError(i18n(Key.musicPlayerErrorPlaylist));
			this.loadLocalPlaylist();
			this.state.isLoading = false;
		}
		this.broadcastState();
	}

	/** 把 Meting 返回的字段归一化为内部 Song 结构，并将时长统一为秒 */
	private convertMetingSong(song: any): Song {
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

	/** 使用内置的本地歌单，空列表时给出错误提示 */
	private loadLocalPlaylist(): void {
		this.state.playlist = [...LOCAL_PLAYLIST];
		if (this.state.playlist.length === 0) {
			this.showError("本地播放列表为空");
		} else {
			this.loadSong(this.state.playlist[0], false);
		}
	}

	/** 切换当前歌曲并设置音频源；默认不预加载整段音频，避免首屏挂起请求 */
	private loadSong(song: Song, autoPlay = true): void {
		if (!song) {
			return;
		}
		if (song.url !== this.state.currentSong.url) {
			this.state.currentSong = { ...song };
			// 歌单已带时长，先展示正确总时长；不预加载音频，只有自动播放时才显示 loading
			if (song.duration && song.duration > 0) {
				this.state.duration = song.duration;
			}
			this.state.isLoading = autoPlay && !!song.url;
		}
		this.state.willAutoPlay = autoPlay;
		if (this.audio) {
			if (this.audio.src && song.url) {
				this.audio.src = "";
			}
			this.audio.src = getAssetPath(song.url);
			// 不主动 load()：等用户点击播放时再拉取音频，
			// 避免初始化就产生永不结束的流式请求而阻塞 load 事件
			if (autoPlay) {
				this.audio.load();
			}
		}
		this.broadcastState();
	}

	/** 展示错误提示，3 秒后自动隐藏 */
	private showError(message: string): void {
		this.state.errorMessage = message;
		this.state.showError = true;
		setTimeout(() => {
			this.state.showError = false;
			this.broadcastState();
		}, 3000);
		this.broadcastState();
	}

	/** 手动关闭错误提示 */
	hideError(): void {
		this.state.showError = false;
		this.broadcastState();
	}

	/** 在播放与暂停之间切换 */
	toggle(): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		if (this.state.isPlaying) {
			this.audio.pause();
		} else {
			this.audio.play().catch(() => {});
		}
	}

	/** 开始播放当前歌曲 */
	play(): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		this.audio.play().catch(() => {});
	}

	/** 暂停当前歌曲 */
	pause(): void {
		if (!this.audio) {
			return;
		}
		this.audio.pause();
	}

	/** 切到下一首；随机模式下随机取一首（避免重复当前曲目） */
	next(autoPlay = true): void {
		if (this.state.playlist.length <= 1) {
			return;
		}

		let newIndex: number;
		if (this.state.isShuffled) {
			do {
				newIndex = Math.floor(
					Math.random() * this.state.playlist.length,
				);
			} while (
				newIndex === this.state.currentIndex &&
				this.state.playlist.length > 1
			);
		} else {
			newIndex =
				this.state.currentIndex < this.state.playlist.length - 1
					? this.state.currentIndex + 1
					: 0;
		}

		this.state.currentIndex = newIndex;
		this.loadSong(this.state.playlist[newIndex], autoPlay);
	}

	/** 切到上一首，越界时回到列表末尾 */
	prev(): void {
		if (this.state.playlist.length <= 1) {
			return;
		}
		const newIndex =
			this.state.currentIndex > 0
				? this.state.currentIndex - 1
				: this.state.playlist.length - 1;
		this.state.currentIndex = newIndex;
		this.loadSong(this.state.playlist[newIndex], true);
	}

	/** 播放歌单中指定下标的歌曲 */
	playIndex(index: number): void {
		if (index < 0 || index >= this.state.playlist.length) {
			return;
		}
		this.state.currentIndex = index;
		this.loadSong(this.state.playlist[index], true);
	}

	/** 跳转到指定秒数，超出时长范围时忽略 */
	seek(time: number): void {
		if (!this.audio) {
			return;
		}
		if (time >= 0 && time <= this.state.duration) {
			this.audio.currentTime = time;
			this.state.currentTime = time;
			this.broadcastState();
		}
	}

	/** 设置音量（自动裁剪到 0-1），0 视为静音并持久化到 localStorage */
	setVolume(volume: number): void {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		this.state.volume = clampedVolume;
		this.state.isMuted = clampedVolume === 0;
		if (this.audio) {
			this.audio.volume = clampedVolume;
			this.audio.muted = this.state.isMuted;
		}
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(STORAGE_KEY_VOLUME, String(clampedVolume));
		}
		this.broadcastState();
	}

	/** 切换静音状态 */
	toggleMute(): void {
		this.state.isMuted = !this.state.isMuted;
		if (this.audio) {
			this.audio.muted = this.state.isMuted;
		}
		this.broadcastState();
	}

	/** 切换随机播放；开启时关闭循环模式，两者互斥 */
	toggleShuffle(): void {
		this.state.isShuffled = !this.state.isShuffled;
		if (this.state.isShuffled) {
			this.state.isRepeating = 0;
		}
		this.broadcastState();
	}

	/** 循环模式在三态间轮换：关闭 → 单曲循环 → 列表循环 */
	toggleRepeat(): void {
		this.state.isRepeating = ((this.state.isRepeating + 1) %
			3) as RepeatMode;
		if (this.state.isRepeating !== 0) {
			this.state.isShuffled = false;
		}
		this.broadcastState();
	}

	/** 依次切换播放模式：随机 → 列表循环 → 单曲循环（与随机互斥） */
	toggleMode(): void {
		if (this.state.isShuffled) {
			this.toggleShuffle();
			return;
		}
		if (this.state.isRepeating === 2) {
			this.toggleRepeat();
			this.toggleShuffle();
			return;
		}
		this.toggleRepeat();
	}

	/** 展开或收起歌单列表 */
	togglePlaylist(): void {
		this.state.showPlaylist = !this.state.showPlaylist;
		this.broadcastState();
	}

	/** 展开或收起播放面板；首次打开时补齐懒初始化 */
	toggleExpanded(): void {
		// 播放器是懒初始化的（避免首屏加载歌单与音频流），
		// 用户主动打开面板时立即补齐初始化
		if (!this.isInitialized) {
			void this.initialize();
		}
		this.state.isExpanded = !this.state.isExpanded;
		// 保持与原先 usePlayerState.toggleExpandedUI 一致的联动行为：
		// 展开时强制取消隐藏，并关闭播放列表，避免状态组合异常
		if (this.state.isExpanded) {
			this.state.showPlaylist = false;
			this.state.isHidden = false;
		}
		this.broadcastState();
	}

	/** 收起或显示播放器小球，隐藏时一并关闭面板与歌单 */
	toggleHidden(): void {
		this.state.isHidden = !this.state.isHidden;
		// 保持与原先 usePlayerState.toggleHiddenUI 一致的联动行为：
		// 隐藏时收起播放器并关闭播放列表，防止展开 UI 悬挂在小球旁边
		if (this.state.isHidden) {
			this.state.isExpanded = false;
			this.state.showPlaylist = false;
		}
		this.broadcastState();
	}

	/** 歌单多于一首时才允许切歌 */
	canSkip(): boolean {
		return this.state.playlist.length > 1;
	}

	/** 按百分比设置播放进度，供进度条拖拽使用 */
	setProgress(percent: number): void {
		if (!this.audio) {
			return;
		}
		const newTime = percent * this.state.duration;
		this.audio.currentTime = newTime;
		this.state.currentTime = newTime;
		this.broadcastState();
	}

	/** 向所有订阅者广播状态，并在 window 上派发事件供非 Svelte 脚本感知 */
	private broadcastState(): void {
		const snapshot = this.createSnapshot();

		for (const listener of this.listeners) {
			listener(snapshot);
		}

		if (typeof window === "undefined") {
			return;
		}
		window.dispatchEvent(
			new CustomEvent("music-sidebar:state", {
				detail: snapshot,
			}),
		);
	}

	/** 销毁播放器：解绑交互监听、停止并释放 Audio，允许之后重新初始化 */
	destroy(): void {
		if (this.unregisterInteraction) {
			this.unregisterInteraction();
		}
		if (this.audio) {
			this.audio.pause();
			this.audio.src = "";
			this.audio = null;
		}
		this.isInitialized = false;
	}
}

/** 全局唯一实例，组件通过导入它共享同一份播放状态 */
export const musicPlayerStore = new MusicPlayerStore();
