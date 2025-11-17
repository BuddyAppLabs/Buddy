import { createOpenAI } from "@ai-sdk/openai";
import type { ProviderInterface, ModelResult } from "../types";

const MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"];
const TAG_NAME = "think";

export class OpenAiProvider implements ProviderInterface {
	getModel(modelName: string, key: string): ModelResult {
		if (!MODELS.includes(modelName)) {
			throw new Error(
				`不支持的模型: ${modelName}。支持的模型: ${MODELS.join(", ")}`,
			);
		}

		return {
			model: createOpenAI({
				apiKey: key,
			})(modelName),
			tagName: TAG_NAME,
		};
	}

	getModels(): string[] {
		return MODELS;
	}
}
