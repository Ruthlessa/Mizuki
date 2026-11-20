/**
 * 打字机组件的 Props 类型定义，供组件外部类型推导使用。
 */
export interface TypewriterTextProps {
	text: string | string[];
	speed?: number;
	deleteSpeed?: number;
	pauseTime?: number;
	class?: string;
}
