import { createOpenAI } from '@ai-sdk/openai';
import type { ProviderInterface, ModelResult } from '../types';

// MegaLLM 支持的模型列表
const MODELS = [
  'claude-sonnet-4-5-20250929',
  'claude-opus-4-1-20250805',
  'claude-sonnet-3-5-20241022',
  'gpt-4o',
  'gpt-4o-mini',
  'gemini-2.0-flash-exp',
];

const TAG_NAME = 'think';

/**
 * MegaLLM 供应商
 * MegaLLM 是 OpenAI 兼容的 API，提供多个模型的统一接口
 * 官网: https://ai.megallm.io
 */
export class MegaLLMProvider implements ProviderInterface {
  getModel(modelName: string, key: string): ModelResult {
    console.log('[MegaLLM] getModel 被调用', {
      modelName,
      hasKey: !!key,
      keyLength: key?.length,
    });

    if (!MODELS.includes(modelName)) {
      throw new Error(
        `不支持的模型: ${modelName}。支持的模型: ${MODELS.join(', ')}`
      );
    }

    if (!key || key.trim() === '') {
      throw new Error('MegaLLM API 密钥不能为空');
    }

    // 使用 createOpenAI 创建 OpenAI 兼容的客户端
    // 设置 baseURL 为 MegaLLM 的 API 端点
    const client = createOpenAI({
      apiKey: key,
      baseURL: 'https://ai.megallm.io/v1',
    });

    console.log(
      '[MegaLLM] OpenAI 客户端已创建，baseURL: https://ai.megallm.io/v1'
    );

    return {
      model: client(modelName),
      tagName: TAG_NAME,
    };
  }

  getModels(): string[] {
    return MODELS;
  }
}
