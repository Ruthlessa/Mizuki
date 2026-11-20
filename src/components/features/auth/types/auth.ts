/** 认证子模块的共享类型：解密结果、提示文案、回调与复制代码选项。 */
export interface PasswordProtectionProps {
	encryptedContent: string;
}

export interface DecryptResult {
	success: boolean;
	content: string | null;
	error: string | null;
}

export interface ValidationMessages {
	unlocking: string;
	incorrect: string;
	decryptError: string;
	unlock: string;
	passwordRequired: string;
	decryptionError: string;
	retry: string;
}

export interface UnlockCallbacks {
	onUnlockStart?: () => void;
	onUnlockSuccess?: (content: string) => void;
	onUnlockError?: (error: string) => void;
}

export interface CopyCodeOptions {
	code: string;
	timeoutId?: number;
}
