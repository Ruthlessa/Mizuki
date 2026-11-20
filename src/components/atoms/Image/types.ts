/**
 * 图片组件的 Props 类型定义，描述图片来源、裁剪位置与加载优先级。
 */
export interface ImageProps {
	id?: string;
	src: string;
	class?: string;
	alt?: string;
	position?: string;
	basePath?: string;
	loading?: "eager" | "lazy";
}
