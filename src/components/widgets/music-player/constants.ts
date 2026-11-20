// 音乐播放器常量：本地歌单、默认歌曲、音量存储键与 Meting API 默认参数。
// 供 hooks 与 UI 组件共享，修改本地歌单需同步维护 cover/url 资源路径。
import type { Song } from "./types";

export const STORAGE_KEY_VOLUME = "music-player-volume";

export const DEFAULT_VOLUME = 0.7;

export const LOCAL_PLAYLIST: Song[] = [
	{
		id: 1,
		title: "口笛で愛は歌えない",
		artist: "Dazbee",
		cover: "assets/music/cover/dazbee.webp",
		url: "assets/music/url/dazbee.mp3",
		duration: 0,
	},
	{
		id: 2,
		title: "ひとり上手",
		artist: "Kaya",
		cover: "assets/music/cover/hitori.webp",
		url: "assets/music/url/hitori.mp3",
		duration: 240,
	},
	{
		id: 3,
		title: "眩耀夜行",
		artist: "ス리즈ブーケ",
		cover: "assets/music/cover/xryx.webp",
		url: "assets/music/url/xryx.mp3",
		duration: 180,
	},
	{
		id: 4,
		title: "春雷の頃",
		artist: "22/7",
		cover: "assets/music/cover/cl.webp",
		url: "assets/music/url/cl.mp3",
		duration: 200,
	},
];

export const DEFAULT_SONG: Song = {
	title: "Sample Song",
	artist: "Sample Artist",
	cover: "/favicon/favicon.ico",
	url: "",
	duration: 0,
	id: 0,
};

export const DEFAULT_METING_API =
	"https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r";
export const DEFAULT_METING_ID = "14164869977";
export const DEFAULT_METING_SERVER = "netease";
export const DEFAULT_METING_TYPE = "playlist";

export const ERROR_DISPLAY_DURATION = 3000;
export const SKIP_ERROR_DELAY = 1000;
