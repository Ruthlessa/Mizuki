export interface SidebarMusicUIState {
	showPlaylist: boolean;
	isCollapsed: boolean;
}

export function createSidebarMusicUIState(): SidebarMusicUIState {
	return {
		showPlaylist: false,
		isCollapsed: false,
	};
}

export function toggleSidebarPlaylist(state: SidebarMusicUIState) {
	state.showPlaylist = !state.showPlaylist;
}

export function toggleSidebarCollapsed(state: SidebarMusicUIState) {
	state.isCollapsed = !state.isCollapsed;
	if (state.isCollapsed) {
		state.showPlaylist = false;
	}
}
