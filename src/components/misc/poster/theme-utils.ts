/**
 * 海报主题色工具：从 CSS 变量 --primary 解析出实际颜色，供 Canvas 绘制使用。
 * 依赖已挂载的 DOM 与浏览器计算样式，因此仅可在客户端调用。
 */
/** 读取 --primary 的实际计算颜色值，读取失败时回退为默认主题色 */
export async function getThemeColor(): Promise<string> {
	return new Promise((resolve) => {
		const temp = document.createElement("div");
		temp.style.color = "var(--primary)";
		temp.style.display = "none";
		document.body.appendChild(temp);

		requestAnimationFrame(() => {
			const computedColor = getComputedStyle(temp).color;
			document.body.removeChild(temp);
			resolve(computedColor || "#558e88");
		});
	});
}
