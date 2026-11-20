/** 看板娘（Paul_Pio）运行配置：开关、模式、位置尺寸及对话与模型资源路径。 */
export interface PioConfig {
	enable: boolean;
	mode?: string;
	hiddenOnMobile?: boolean;
	position?: "left" | "right";
	width?: number;
	height?: number;
	dialog?: Record<string, string>;
	models?: string[];
}

/** 看板娘组件入参：允许调用方以局部覆盖的方式传入配置。 */
export interface PioProps {
	config?: Partial<PioConfig>;
}
