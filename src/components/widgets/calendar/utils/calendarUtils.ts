// 日历日期计算工具：提供月份首日、天数、日期键、今日判断与路径解析等纯函数。
// 以周一为一周起点，被日历组件与相关页面复用。

/** 返回指定年月的 1 号是周几（0 表示周一）。 */
export function getFirstDayOfMonth(year: number, month: number): number {
	return (new Date(year, month, 1).getDay() + 6) % 7;
}

/** 返回指定年月包含的天数，利用下月第 0 天回退得到。 */
export function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

/** 生成 YYYY-MM-DD 形式的日期键，月份入参为 0 起始。 */
export function formatDateKey(
	year: number,
	month: number,
	day: number,
): string {
	return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 生成用于按月索引的月份键（年份-月份，月份不补零）。 */
export function getMonthKey(year: number, month: number): string {
	return `${year}-${month}`;
}

/** 判断给定年月日是否与传入的“今天”三元组一致。 */
export function isToday(
	year: number,
	month: number,
	day: number,
	todayYear: number,
	todayMonth: number,
	todayDate: number,
): boolean {
	return year === todayYear && month === todayMonth && day === todayDate;
}

/** 从文章路径中解析 YYYY-MM-DD 并返回年份与 0 起始月份；无法匹配时返回 null。 */
export function parseDateFromPath(
	path: string,
): { year: number; month: number } | null {
	const match = path.match(/(\d{4})-(\d{2})-\d{2}/);
	if (match) {
		return {
			year: parseInt(match[1]),
			month: parseInt(match[2]) - 1,
		};
	}
	return null;
}
