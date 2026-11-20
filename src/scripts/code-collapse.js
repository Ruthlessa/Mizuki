/**
 * 代码块折叠功能
 * 为 Expressive Code 代码块追加右下角折叠按钮（带标题的代码块除外），并把状态同步到全局 window.codeBlockCollapser。
 * 依赖 Swup 页面切换钩子与 MutationObserver 处理动态插入的代码块，主题切换期间会暂停观察以避免重排抖动。
 */
class CodeBlockCollapser {
	/** 初始化状态并立即启动监听；processedBlocks 用于避免重复增强同一代码块 */
	constructor() {
		this.processedBlocks = new WeakSet();
		this.observer = null;
		this.isThemeChanging = false;
		this.debug = false; // 设置为 true 启用调试日志
		this.init();
	}

	/** 统一调试日志出口，仅在 debug 开启时输出 */
	log(...args) {
		if (this.debug) {
			console.log("[CodeBlockCollapser]", ...args);
		}
	}

	/** 启动入口：处理已有代码块并注册页面变化、主题变化相关监听 */
	init() {
		this.log("Initializing...");
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => {
				this.log("DOMContentLoaded - setting up code blocks");
				this.setupCodeBlocks();
			});
		} else {
			this.log("Document already loaded - setting up code blocks");
			this.setupCodeBlocks();
		}
		this.observePageChanges();
		this.setupThemeChangeListener();
		this.setupThemeOptimizerSync();
	}

	/** 与主题优化器对齐折叠行为：在初始化完成与页面切换后各同步一次 */
	setupThemeOptimizerSync() {
		// 与主题优化器同步，确保代码块的隐藏/显示行为一致
		this.syncWithThemeOptimizer();

		// 监听主题优化器初始化完成事件
		document.addEventListener("themeOptimizerReady", () => {
			this.log("Theme optimizer ready, syncing code block behavior");
			this.syncWithThemeOptimizer();
		});

		// 监听页面切换事件，确保同步
		document.addEventListener("swup:pageView", () => {
			// 延迟同步，确保主题优化器已经处理完代码块
			setTimeout(() => {
				this.syncWithThemeOptimizer();
			}, 150);
		});
	}

	/** 读取主题优化器的开关，决定代码块在过渡期间是否隐藏；优化器缺失时默认隐藏 */
	syncWithThemeOptimizer() {
		// 检查主题优化器是否存在
		if (window.themeOptimizer) {
			// 获取当前主题优化器的设置
			const shouldHideDuringTransition =
				window.themeOptimizer.hideCodeBlocksDuringTransition;

			// 应用相同的设置到代码块
			const codeBlocks = document.querySelectorAll(".expressive-code");
			codeBlocks.forEach((block) => {
				if (shouldHideDuringTransition) {
					block.classList.add("hide-during-transition");
				} else {
					block.classList.remove("hide-during-transition");
				}
			});

			this.log(
				`Synced with theme optimizer: hide code blocks during transition = ${shouldHideDuringTransition}`,
			);
		} else {
			// 如果主题优化器不存在，应用默认行为
			const codeBlocks = document.querySelectorAll(".expressive-code");
			codeBlocks.forEach((block) => {
				block.classList.add("hide-during-transition");
			});

			this.log("Theme optimizer not available, applied default behavior");
		}
	}

	/** 监听 <html> 上的 class/data-theme 变化，判断主题切换开始与结束并暂停/恢复观察 */
	setupThemeChangeListener() {
		// 监听主题切换，在切换期间暂停 observer 和优化性能
		const themeObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === "attributes" &&
					(mutation.attributeName === "class" ||
						mutation.attributeName === "data-theme")
				) {
					const isTransitioning =
						document.documentElement.classList.contains(
							"is-theme-transitioning",
						);

					if (isTransitioning && !this.isThemeChanging) {
						this.isThemeChanging = true;

						// 断开 observer 以避免在主题切换时进行不必要的检查
						if (this.observer) {
							this.observer.disconnect();
						}

						// 性能优化：临时禁用代码块的动画和过渡
						document
							.querySelectorAll(".expressive-code")
							.forEach((block) => {
								block.style.transition = "none";
							});
					} else if (!isTransitioning && this.isThemeChanging) {
						this.isThemeChanging = false;

						// 等待主题切换完全结束后再恢复
						requestAnimationFrame(() => {
							// 恢复代码块的过渡效果
							document
								.querySelectorAll(".expressive-code")
								.forEach((block) => {
									block.style.transition = "";
								});

							// 重新连接 observer
							setTimeout(() => {
								this.observePageChanges();
							}, 50);
						});
					}
					break;
				}
			}
		});

		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "data-theme"],
		});
	}

	/** 找到所有尚未处理过的代码块并逐个增强 */
	setupCodeBlocks() {
		requestAnimationFrame(() => {
			const codeBlocks = document.querySelectorAll(".expressive-code");
			this.log(`Found ${codeBlocks.length} code blocks to process`);

			codeBlocks.forEach((codeBlock, index) => {
				if (!this.processedBlocks.has(codeBlock)) {
					this.log(`Enhancing code block ${index + 1}`);
					this.enhanceCodeBlock(codeBlock);
					this.processedBlocks.add(codeBlock);
				} else {
					this.log(`Code block ${index + 1} already processed`);
				}
			});
		});
	}

	/** 给单个代码块加上 collapsible/expanded 类并注入折叠按钮；无 frame 或带标题时跳过 */
	enhanceCodeBlock(codeBlock) {
		const frame = codeBlock.querySelector(".frame");
		if (!frame) {
			this.log("No frame found in code block, skipping");
			return;
		}

		if (frame.classList.contains("has-title")) {
			this.log("Code block has title, skipping collapse feature");
			return;
		}

		this.log("Adding collapse feature to code block");
		codeBlock.classList.add("collapsible", "expanded");

		const toggleBtn = this.createToggleButton();
		frame.appendChild(toggleBtn);

		this.bindToggleEvents(codeBlock, toggleBtn);
	}

	/** 创建带内联 SVG 箭头的折叠按钮 */
	createToggleButton() {
		const button = document.createElement("button");
		button.className = "collapse-toggle-btn";
		button.type = "button";
		button.setAttribute("aria-label", "折叠/展开代码块");

		button.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g fill="none">
          <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
          <path fill="currentColor" d="m12 16.172l-4.95-4.95a1 1 0 1 0-1.414 1.414l5.657 5.657a1 1 0 0 0 1.414 0l5.657-5.657a1 1 0 0 0-1.414-1.414z"></path>
        </g>
      </svg>
    `;

		return button;
	}

	/** 绑定点击与键盘（Enter/空格）触发切换，保证可访问性 */
	bindToggleEvents(codeBlock, button) {
		button.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.toggleCollapse(codeBlock);
		});

		button.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				this.toggleCollapse(codeBlock);
			}
		});
	}

	/** 在 collapsed/expanded 之间切换，并派发 codeBlockToggle 事件供外部监听 */
	toggleCollapse(codeBlock) {
		const isCollapsed = codeBlock.classList.contains("collapsed");

		requestAnimationFrame(() => {
			if (isCollapsed) {
				codeBlock.classList.remove("collapsed");
				codeBlock.classList.add("expanded");
			} else {
				codeBlock.classList.remove("expanded");
				codeBlock.classList.add("collapsed");
			}
		});

		const event = new CustomEvent("codeBlockToggle", {
			detail: { collapsed: !isCollapsed, element: codeBlock },
		});
		document.dispatchEvent(event);
	}

	/** 观察 body 的 DOM 变化，发现新增代码块时做 30ms 防抖后重新扫描 */
	observePageChanges() {
		// 如果正在主题切换，不要重新连接
		if (this.isThemeChanging) {
			return;
		}

		// 断开现有的 observer
		if (this.observer) {
			this.observer.disconnect();
		}

		let debounceTimer = null;

		this.observer = new MutationObserver((mutations) => {
			// 如果正在主题切换，忽略所有变化
			if (this.isThemeChanging) {
				return;
			}

			let shouldReinit = false;

			// 外层循环：遍历所有变动
			for (const mutation of mutations) {
				if (
					mutation.type === "childList" &&
					mutation.addedNodes.length > 0
				) {
					// 内层循环：遍历新增节点
					for (const node of mutation.addedNodes) {
						// 只检查元素节点 (nodeType 1)
						if (node.nodeType === Node.ELEMENT_NODE) {
							if (
								node.classList.contains("expressive-code") ||
								(node.getElementsByClassName &&
									node.getElementsByClassName(
										"expressive-code",
									).length > 0)
							) {
								shouldReinit = true;
								break;
							}
						}
					}
				}
				if (shouldReinit) {
					break;
				}
			}

			if (shouldReinit) {
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(() => this.setupCodeBlocks(), 30);
			}
		});

		this.observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	/** 销毁实例：断开观察器并清空已处理记录 */
	destroy() {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
		this.processedBlocks = new WeakSet();
	}

	// 公共API方法
	/** 折叠所有当前展开的代码块 */
	collapseAll() {
		const allBlocks = document.querySelectorAll(
			".expressive-code.expanded",
		);
		allBlocks.forEach((block) => {
			this.toggleCollapse(block);
		});
	}

	/** 展开所有当前折叠的代码块 */
	expandAll() {
		const allBlocks = document.querySelectorAll(
			".expressive-code.collapsed",
		);
		allBlocks.forEach((block) => {
			this.toggleCollapse(block);
		});
	}
}

const codeBlockCollapser = new CodeBlockCollapser();

window.CodeBlockCollapser = CodeBlockCollapser;
window.codeBlockCollapser = codeBlockCollapser;

// 设置 Swup 钩子的函数
/** 注册 Swup 钩子，在页面切换后重置已处理记录并重新扫描代码块；未就绪时返回 false */
function setupSwupHooks() {
	if (window.swup) {
		codeBlockCollapser.log("Setting up Swup hooks");

		// 监听 page:view 事件
		window.swup.hooks.on("page:view", () => {
			codeBlockCollapser.log(
				"Swup page:view event - reinitializing code blocks",
			);
			// 页面切换后重置 processedBlocks，确保新页面的代码块被处理
			codeBlockCollapser.processedBlocks = new WeakSet();
			setTimeout(() => {
				codeBlockCollapser.setupCodeBlocks();
			}, 100);
		});

		// 监听 content:replace 事件（更早触发）
		window.swup.hooks.on("content:replace", () => {
			codeBlockCollapser.log(
				"Swup content:replace event - preparing for reinitialization",
			);
			// 内容替换时也重置，确保不会因为缓存而跳过处理
			codeBlockCollapser.processedBlocks = new WeakSet();
			setTimeout(() => {
				codeBlockCollapser.setupCodeBlocks();
			}, 50);
		});

		return true;
	}
	return false;
}

// 尝试立即设置 Swup 钩子
if (!setupSwupHooks()) {
	// 如果 Swup 尚未初始化，等待它加载
	codeBlockCollapser.log("Swup not ready, waiting for initialization");

	// 监听 swup:enable 事件
	document.addEventListener("swup:enable", () => {
		codeBlockCollapser.log("Swup enabled, setting up hooks");
		setupSwupHooks();
	});

	// 额外的延迟重试机制，确保捕获到 Swup
	// Swup 脚本可能晚于本脚本加载，因此每 100ms 重试一次，2 秒后放弃
	const retryInterval = setInterval(() => {
		if (setupSwupHooks()) {
			codeBlockCollapser.log("Swup hooks set up successfully via retry");
			clearInterval(retryInterval);
		}
	}, 100);

	// 最多重试 20 次（2 秒）
	setTimeout(() => {
		clearInterval(retryInterval);
	}, 2000);
}
