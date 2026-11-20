// 侧栏音乐面板的轻量 UI 状态：仅维护播放列表展开标记。
export interface SidebarMusicUIState {
	showPlaylist: boolean;
}

/** 创建侧栏音乐 UI 初始状态（播放列表默认收起）。 */
export function createSidebarMusicUIState(): SidebarMusicUIState {
	return {
		showPlaylist: false,
	};
}

/** 切换播放列表展开状态。 */
export function toggleSidebarPlaylist(state: SidebarMusicUIState) {
	state.showPlaylist = !state.showPlaylist;
}
