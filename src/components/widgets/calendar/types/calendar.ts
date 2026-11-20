// 日历组件的公共类型定义：文章条目、索引结构、网格单元格与子组件 Props。
// 被 Calendar.svelte 及其 components/*、hooks/useCalendar.ts 共同引用。
export interface CalendarPost {
	id: string;
	title: string;
	date: string;
}

export interface CalendarStats {
	hasPostInYear: Record<number, boolean>;
	hasPostInMonth: Record<string, boolean>;
	minYear: number;
	maxYear: number;
}

export interface CalendarState {
	currentYear: number;
	currentMonth: number;
	selectedDateKey: string | null;
	currentView: "day" | "month" | "year";
}

export interface CalendarDataIndexes {
	postDateMap: Record<string, CalendarPost[]>;
	postsByMonth: Record<string, CalendarPost[]>;
	stats: CalendarStats;
}

export interface CalendarGridCell {
	day: number;
	dateKey: string;
	posts: CalendarPost[];
	hasPost: boolean;
	postCount: number;
	isToday: boolean;
	isSelected: boolean;
	isEmpty: boolean;
}

export type MonthNames = string[];
export type WeekDays = string[];

export interface CalendarHeaderProps {
	monthNames: MonthNames;
	weekDays: WeekDays;
	yearSuffix: string;
	currentYear: number;
	currentMonth: number;
	currentView: "day" | "month" | "year";
	isBackToTodayVisible: boolean;
	onPrevMonth: () => void;
	onNextMonth: () => void;
	onBackToToday: () => void;
	onTitleClick: () => void;
}

export interface CalendarGridProps {
	weekDays: WeekDays;
	year: number;
	month: number;
	cells: CalendarGridCell[];
	emptyCellsCount: number;
	selectedDateKey: string | null;
	onCellClick: (dateKey: string) => void;
}

export interface PostListProps {
	posts: CalendarPost[];
	currentPostId: string | null;
	isEmpty: boolean;
}
