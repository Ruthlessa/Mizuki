/**
 * 动画测试工具：在浏览器控制台检查页面过渡动画元素与样式状态，仅用于调试。
 * 通过 window 暴露测试函数，不参与生产构建流程中的业务逻辑。
 */
// 动画测试工具 - 验证yukina风格的侧滑效果

/** 统计并打印过渡/入场动画元素的数量与计算样式，返回汇总结果便于断言 */
export function testSlideAnimation() {
	console.log("Testing slide animation effects...");

	// 测试主要动画元素
	const mainElements = document.querySelectorAll(".transition-main");
	const animationElements = document.querySelectorAll(".onload-animation");

	console.log(`Found ${mainElements.length} main transition elements`);
	console.log(`Found ${animationElements.length} onload animation elements`);

	// 检查CSS动画属性
	mainElements.forEach((el, index) => {
		const styles = window.getComputedStyle(el);
		console.log(`Element ${index}:`, {
			transition: styles.transition,
			transform: styles.transform,
			opacity: styles.opacity,
		});
	});

	return {
		mainElements: mainElements.length,
		animationElements: animationElements.length,
		status: "Animation test completed",
	};
}

// 模拟页面切换动画
/** 手动添加/移除过渡状态类，模拟一次页面切换动画便于观察效果 */
export function simulatePageTransition() {
	const body = document.body;
	const html = document.documentElement;

	// 添加离开状态
	html.classList.add("is-animating", "is-leaving");

	setTimeout(() => {
		// 移除离开状态，添加进入状态
		html.classList.remove("is-leaving");

		setTimeout(() => {
			// 完成动画
			html.classList.remove("is-animating");
			console.log("Page transition simulation completed");
		}, 300);
	}, 300);
}

// 在控制台中可用的测试函数
if (typeof window !== "undefined") {
	window.testSlideAnimation = testSlideAnimation;
	window.simulatePageTransition = simulatePageTransition;
}
