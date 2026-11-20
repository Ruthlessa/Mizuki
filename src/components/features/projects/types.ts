/** 项目数据模型：基础信息、技术栈、状态、外链与展示开关。 */
export interface Project {
	id: string;
	title: string;
	description: string;
	image?: string;
	category: string;
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	demoUrl?: string;
	sourceUrl?: string;
	liveDemo?: string;
	sourceCode?: string;
	visitUrl?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	showImage?: boolean;
}

/** 项目卡片入参：项目数据、尺寸、封面与技术栈展示上限。 */
export interface ProjectCardProps {
	project: Project;
	size?: "small" | "medium" | "large";
	showImage?: boolean;
	maxTechStack?: number;
}
