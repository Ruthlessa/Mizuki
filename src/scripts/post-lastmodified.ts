/**
 * 文章「最后更新时间」计时器
 * 每秒刷新一次 #modifiedtime 元素，把 data-last-modified 到现在的时间差格式化为「x 年 x 月 x 天 xx 时 xx 分 xx 秒」。
 * 年/月按 365 天、30 天近似换算，仅用于展示不必精确。
 */
export interface LastModifiedOptions {
	prefix: string;
	year: string;
	month: string;
	day: string;
	hour: string;
	minute: string;
	second: string;
}

/** 启动计时：读取 #last-modified 上的时间戳并每秒重算展示文本 */
export function initLastModifiedHandler(options: LastModifiedOptions) {
	const { prefix, year, month, day, hour, minute, second } = options;

	/** 计算并渲染「距离最后更新已过去多久」 */
	function updateLastModified(lastModified: string) {
		const startDate = new Date(lastModified);
		const currentDate: Date = new Date();
		const diff: number = currentDate.getTime() - startDate.getTime();
		const seconds = Math.floor(diff / 1000);
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		// 按 365 天/年、30 天/月做粗略拆分，只取整不追求日历精度
		const years = Math.floor(days / 365);
		const months = Math.floor((days % 365) / 30);
		const remainingDays = days % 30;

		let result = prefix + " ";
		if (years > 0) {
			result += `${years} ${year} `;
		}
		if (months > 0) {
			result += `${months} ${month} `;
		}
		if (remainingDays > 0) {
			result += `${remainingDays} ${day} `;
		}
		result += `${hours} ${hour} `;
		result += `${mins < 10 ? "0" : ""}${mins} ${minute} `;
		result += `${secs < 10 ? "0" : ""}${secs} ${second}`;

		const element = document.getElementById("modifiedtime");
		if (element) {
			element.innerHTML = result;
		}
	}

	const element = document.getElementById("last-modified");
	if (element) {
		updateLastModified(element.dataset.lastModified || "");
		// 每秒钟刷新一次，让秒数真实跳动
		setInterval(() => {
			updateLastModified(element.dataset.lastModified || "");
		}, 1000);
	}
}
