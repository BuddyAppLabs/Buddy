import { LanguageModelV1, wrapLanguageModel } from 'ai';
import { ProviderName } from './ChatService';
import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createLogMiddleware } from './middleware/log.mid';
import { IChatLogger } from './contract/IChatLogger';

export class ModelService {
  models = [
    {
      id: 'deepseek-chat',
      object: 'model',
      name: 'DeepSeek Chat',
      provider: 'DeepSeek',
    },
    {
      id: 'gpt-4o',
      object: 'model',
      name: 'GPT-4O',
      provider: 'OpenAI',
    },
    {
      id: 'gpt-4o-mini',
      object: 'model',
      name: 'GPT-4O Mini',
      provider: 'OpenAI',
    },
    {
      id: 'gpt-3.5-turbo',
      object: 'model',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
    },
    {
      id: 'claude-3-5-sonnet',
      object: 'model',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
    },
  ];

  getModel(
    modelId: string,
    key: string,
    logger: IChatLogger | null = null
  ): LanguageModelV1 {
    let model: LanguageModelV1;
    switch (modelId) {
      case 'deepseek-chat':
        model = createDeepSeek({
          apiKey: key,
        })('deepseek-chat');
        break;

      default:
        throw new Error(`Unsupported Model: ${modelId}`);
    }

    return wrapLanguageModel({
      model: model,
      middleware: [
        // extractReasoningMiddleware({ tagName: 'think' }),
        // simulateStreamingMiddleware(),
        createLogMiddleware(logger),
        // createCacheMiddleware(this.cacheRepo),
      ],
    });
  }

  public getModelList() {
    return this.models.map(({ id, object, name, provider }) => ({
      id,
      object,
      name,
      provider,
    }));
  }
}
