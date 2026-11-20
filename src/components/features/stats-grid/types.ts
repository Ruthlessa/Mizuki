/** 统计网格组件的入参类型定义 */
import type { StatCardProps } from "../stats/types";

/** 统计网格入参：卡片数据列表、桌面端列数与额外样式类。 */
export interface StatsGridProps {
	stats: StatCardProps[];
	columns?: 2 | 3 | 4;
	class?: string;
}
