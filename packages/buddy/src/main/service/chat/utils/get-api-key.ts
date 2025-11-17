import type { ProviderName } from "../types";

/**
 * 从 Cloudflare Workers 环境变量中获取指定 provider 的 API key
 * 支持 secrets store secrets（使用 .get() 方法）和普通环境变量
 */
export async function getApiKey(
	env: any,
	provider: ProviderName,
): Promise<string | undefined> {
	console.log(`[GetApiKey] 开始获取 API key, provider: ${provider}`);
	let keySecret: any;
	let keyName: string;

	// 根据 provider 确定要获取的 key
	switch (provider) {
		case "openai":
			keySecret = env?.OPENAI_API_KEY;
			keyName = "OPENAI_API_KEY";
			break;
		case "anthropic":
			keySecret = env?.ANTHROPIC_API_KEY;
			keyName = "ANTHROPIC_API_KEY";
			break;
		case "deepseek":
			keySecret = env?.DEEPSEEK_API_KEY;
			keyName = "DEEPSEEK_API_KEY";
			break;
		case "openrouter":
			keySecret = env?.OPENROUTER_API_KEY;
			keyName = "OPENROUTER_API_KEY";
			break;
		default:
			console.log(`[GetApiKey] ❌ 不支持的 provider: ${provider}`);
			return undefined;
	}

	console.log(`[GetApiKey] provider是${provider}，key名称: ${keyName}`);

	if (!keySecret) {
		console.log(`[GetApiKey] ❌ ${keyName} 不存在`);
		return undefined;
	}

	console.log(`[GetApiKey] ${keyName} 存在，类型: ${typeof keySecret}`);

	// 如果是 secrets store secret（对象），需要调用 .get() 方法
	if (typeof keySecret === "object" && "get" in keySecret) {
		console.log(
			`[GetApiKey] ${keyName} 是 secrets store secret，调用 .get() 方法`,
		);
		try {
			const keyValue = await keySecret.get();
			const keyLength = keyValue?.length || 0;
			const keyPrefix =
				keyValue && typeof keyValue === "string" && keyLength > 0
					? keyValue.slice(0, 20)
					: "N/A";
			console.log(
				`[GetApiKey] 成功获取 ${keyName}，长度: ${keyLength}，前20个字符: ${keyPrefix}...`,
			);
			return keyValue;
		} catch (error) {
			console.error(`[GetApiKey] ❌ 获取 ${keyName} 失败:`, error);
			return undefined;
		}
	}

	// 如果是普通字符串，直接返回
	if (typeof keySecret === "string") {
		const keyLength = keySecret.length;
		const keyPrefix = keyLength > 0 ? keySecret.slice(0, 20) : "N/A";
		console.log(
			`[GetApiKey] 成功获取 ${keyName}，长度: ${keyLength}，前20个字符: ${keyPrefix}...`,
		);
		return keySecret;
	}

	console.log(`[GetApiKey] ❌ ${keyName} 类型不支持: ${typeof keySecret}`);
	return undefined;
}

/**
 * 检查 API key 是否有效
 */
export function checkApiKey(
	provider: ProviderName,
	apiKey: string | undefined,
	isChinese: boolean,
): { isValid: boolean; keyValue?: string; errorResponse?: Response } {
	console.log(
		`[CheckApiKey] 开始检查 API key, provider: ${provider}, apiKey存在: ${!!apiKey}`,
	);

	if (!apiKey) {
		const errorMessage = isChinese
			? `${provider} API 密钥未配置，请在 Cloudflare 控制台配置 ${provider.toUpperCase()}_API_KEY`
			: `${provider} API key not configured, please configure ${provider.toUpperCase()}_API_KEY in Cloudflare console`;

		return {
			isValid: false,
			errorResponse: new Response(
				JSON.stringify({
					error: errorMessage,
					code: "API_KEY_MISSING",
					keyName: `${provider.toUpperCase()}_API_KEY`,
					configHint: isChinese
						? "请在 Cloudflare Workers 的环境变量或 Secrets 中配置 API 密钥"
						: "Please configure the API key in Cloudflare Workers environment variables or Secrets",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			),
		};
	}

	const keyValue = apiKey.trim();
	if (!keyValue) {
		const errorMessage = isChinese
			? `${provider} API 密钥为空`
			: `${provider} API key is empty`;

		return {
			isValid: false,
			errorResponse: new Response(
				JSON.stringify({
					error: errorMessage,
					code: "API_KEY_EMPTY",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			),
		};
	}

	console.log(
		`[CheckApiKey] ✅ API key 检查通过: ${provider}, 长度: ${keyValue.length}`,
	);
	return {
		isValid: true,
		keyValue,
	};
}
