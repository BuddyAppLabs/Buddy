import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { ProviderInterface, ModelResult } from "../types";

const MODELS = [
	{
		name: "deepseek/deepseek-chat-v3.1:free",
		tagName: "think",
	},
	{
		name: "deepseek/deepseek-chat-v3-0324:free",
		tagName: "think",
	},
	{
		name: "google/gemini-2.0-flash-exp:free",
		tagName: "think",
	},
	{
		name: "mistralai/mistral-small-3.2-24b-instruct:free",
		tagName: "think",
	},
	{
		name: "meta-llama/llama-3.3-70b-instruct:free",
		tagName: "think",
	},
	{
		name: "openai/gpt-4o-mini:free",
		tagName: "think",
	},
	{
		name: "openai/gpt-oss-20b:free",
		tagName: "think",
	},
	{
		name: "openai/gpt-5.1",
		tagName: "think",
	},
	{
		name: "qwen/qwen3-235b-a22b:free",
		tagName: "think",
	},
	{
		name: "qwen/qwen3-coder:free",
		tagName: "think",
	},
	{
		name: "z-ai/glm-4.5-air:free",
		tagName: "think",
	},
];

export class OpenRouterProvider implements ProviderInterface {
	getModel(modelName: string, key: string): ModelResult {
		const modelConfig = MODELS.find((model) => model.name === modelName);
		if (!modelConfig) {
			const supportedModels = MODELS.map((m) => m.name).join(", ");
			throw new Error(
				`不支持的模型: ${modelName}。支持的模型: ${supportedModels}`,
			);
		}

		return {
			model: createOpenRouter({
				apiKey: key,
			}).chat(modelConfig.name),
			tagName: modelConfig.tagName,
		};
	}

	getModels(): string[] {
		return MODELS.map((model) => model.name);
	}
}
