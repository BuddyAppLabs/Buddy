import type { LanguageModelV2 } from '@ai-sdk/provider';
import { OpenRouterProvider } from './providers/openrouter';
import { OpenAiProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { DeepSeekProvider } from './providers/deepseek';
import { MegaLLMProvider } from './providers/megallm';

// 供应商配置
export const PROVIDER_CONFIG = {
  deepseek: DeepSeekProvider,
  openai: OpenAiProvider,
  anthropic: AnthropicProvider,
  openrouter: OpenRouterProvider,
  megallm: MegaLLMProvider,
};

export type ProviderName = keyof typeof PROVIDER_CONFIG;

export type CreateStreamParams = {
  provider: ProviderName;
  modelName: string;
  key: string;
  messages: any;
  user?: any;
  conversationId?: string;
  systemPrompt?: string;
  dashScopeApiKey?: string;
};

export interface ProviderInterface {
  getModel(modelName: string, key: string): ModelResult;
  getModels(): string[];
}

export interface ModelResult {
  model: LanguageModelV2;
  tagName: string;
}

export interface ProviderResult {
  provider_name: ProviderName;
  models: string[];
}
