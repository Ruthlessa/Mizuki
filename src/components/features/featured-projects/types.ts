/** 精选项目区块的组件入参类型定义 */
import type { Project } from "../projects/types";

/** 精选项目入参：项目列表、可选区块标题与额外样式类。 */
export interface FeaturedProjectsProps {
	projects: Project[];
	title?: string;
	class?: string;
}
