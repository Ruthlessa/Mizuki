/** 密码保护相关组件入参：加密内容字符串与用于加密的密码。 */
export interface PasswordProtectionProps {
	encryptedContent: string;
}

export interface EncryptorProps {
	password: string | number;
}
