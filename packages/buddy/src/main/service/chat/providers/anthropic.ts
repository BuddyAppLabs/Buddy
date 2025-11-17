import { createAnthropic } from "@ai-sdk/anthropic";
import type { ProviderInterface, ModelResult } from "../types";

const MODELS = [
	"claude-3-5-sonnet-20240620",
	"claude-3-haiku-20240307",
	"claude-3-opus-20240229",
];
const TAG_NAME = "think";

export class AnthropicProvider implements ProviderInterface {
	getModel(modelName: string, key: string): ModelResult {
		if (!MODELS.includes(modelName)) {
			throw new Error(
				`不支持的模型: ${modelName}。支持的模型: ${MODELS.join(", ")}`,
			);
		}

		return {
			model: createAnthropic({
				apiKey: key,
			})(modelName),
			tagName: TAG_NAME,
		};
	}

	getModels(): string[] {
		return MODELS;
	}
}
