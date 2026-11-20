/** 技术栈组件入参：标签列表、可选标题与额外样式类，用于渲染技术关键词胶囊。 */
export interface TechStackProps {
	techStack: string[];
	title?: string;
	class?: string;
}
