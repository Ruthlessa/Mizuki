/** 项目分类区块的组件入参类型定义 */
import type { Project } from "../projects/types";

/** 项目分类区块入参：分类标识、项目列表、显示名称与额外样式类。 */
export interface ProjectsCategoryProps {
	category: string;
	projects: Project[];
	categoryText: string;
	class?: string;
}
