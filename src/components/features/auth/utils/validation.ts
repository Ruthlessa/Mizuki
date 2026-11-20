/**
 * Validation utilities for password protection
 */

/** 判断密码是否有效：非空且去掉首尾空白后仍有内容。 */
export function validatePassword(password: string | null | undefined): boolean {
	return Boolean(password && password.trim().length > 0);
}

/** 在错误提示节点写入文案并显示，节点不存在时静默跳过。 */
export function showError(
	errorMessage: HTMLElement | null,
	message: string,
): void {
	if (errorMessage) {
		errorMessage.textContent = message;
		errorMessage.style.display = "block";
	}
}

/** 隐藏错误提示节点，用于重新提交前清理上一次的提示。 */
export function hideError(errorMessage: HTMLElement | null): void {
	if (errorMessage) {
		errorMessage.style.display = "none";
	}
}

/** 切换输入框可用状态，解密过程中用于禁用输入防止重复提交。 */
export function setInputEnabled(
	input: HTMLInputElement | null,
	enabled: boolean,
): void {
	if (input) {
		input.disabled = !enabled;
	}
}

/** 切换按钮可用状态，并可在需要时同步替换按钮文案。 */
export function setButtonEnabled(
	button: HTMLButtonElement | null,
	enabled: boolean,
	text?: string,
): void {
	if (button) {
		button.disabled = !enabled;
		if (text) {
			button.textContent = text;
		}
	}
}

/** 让密码输入框获得焦点，提升键盘用户的操作效率。 */
export function focusInput(input: HTMLInputElement | null): void {
	if (input) {
		input.focus();
	}
}

/** 读取输入框去除首尾空白后的值，空输入统一返回空字符串。 */
export function getInputValue(input: HTMLInputElement | null): string {
	return input?.value.trim() || "";
}

/** 清空输入框内容，用于解密成功后避免密码残留在页面上。 */
export function clearInput(input: HTMLInputElement | null): void {
	if (input) {
		input.value = "";
	}
}
