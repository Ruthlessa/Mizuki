/** 说说（日记）卡片组件的入参类型定义 */
import type { DiaryItem } from "../../../data/diary";

/** 说说卡片入参：条目数据、序号及多语言相对时间文案。 */
export interface MomentCardProps {
	moment: DiaryItem;
	index: number;
	minutesAgo: string;
	hoursAgo: string;
	daysAgo: string;
}
