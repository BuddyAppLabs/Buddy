import { createDeepSeek } from "@ai-sdk/deepseek";
import type { ProviderInterface, ModelResult } from "../types";

const MODELS = ["deepseek-chat", "deepseek-coder"];
const TAG_NAME = "think";

export class DeepSeekProvider implements ProviderInterface {
	getModel(modelName: string, key: string): ModelResult {
		if (!MODELS.includes(modelName)) {
			throw new Error(
				`不支持的模型: ${modelName}。支持的模型: ${MODELS.join(", ")}`,
			);
		}

		return {
			model: createDeepSeek({
				apiKey: key,
				baseURL: "https://api.deepseek.com",
			})(modelName),
			tagName: TAG_NAME,
		};
	}

	getModels(): string[] {
		return MODELS;
	}
}
