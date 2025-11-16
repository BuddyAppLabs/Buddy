import {
  streamText,
  wrapLanguageModel,
  generateText,
} from 'ai';
import { getTools } from './tools';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createLogMiddleware } from './middleware/log.mid';
import { PROVIDERS } from './constants';
import { IModel } from './contract/IModel';
import { IProvider, ProviderType } from './contract/IProvider';
import { createOpenAI } from '@ai-sdk/openai';
import type { StreamTextResult, UIMessage } from 'ai';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import type { IChatLogger } from './contract/IChatLogger.js';
import type { IConversationRepo } from './contract/IConversationRepo.js';
import { randomUUID } from 'crypto';

export class ChatService {
  providers = PROVIDERS;
  private conversationRepo: IConversationRepo | null = null;
  private logger: IChatLogger | null = null;
  private systemPrompt: string | null = null;

  constructor(
    conversationRepo?: IConversationRepo,
    systemPrompt?: string,
    logger?: IChatLogger
  ) {
    this.conversationRepo = conversationRepo ?? null;
    this.logger = logger ?? null;
    this.systemPrompt = systemPrompt ?? null;

    this.logger?.info('ChatService constructor');
  }

  async generateText(
    modelId: string,
    key: string,
    prompt: string
  ): Promise<string> {
    const model = this.getModel(modelId, key);
    const { text } = await generateText({
      model: model,
      prompt: prompt,
    });

    return text;
  }

  createStream(
    modelId: string,
    key: string,
    messages: UIMessage[],
    user?: any,
    conversationId?: string
  ): StreamTextResult<any, any> {
    const model = this.getModel(modelId, key);
    const conversationRepo = this.conversationRepo;
    const logger = this.logger;

    logger?.info('[ChatService] createStream with modelId:' + modelId);

    return streamText({
      model: model,
      system: this.systemPrompt ?? '',
      messages,
      tools: getTools(logger, user),
      onError: (error) => {
        let statusCode: any;
        let message: any;
        let fullError: any;

        if (
          error.error &&
          typeof error.error === 'object' &&
          'statusCode' in error.error
        ) {
          statusCode = error.error.statusCode;
        }

        if (
          error.error &&
          typeof error.error === 'object' &&
          'responseBody' in error.error
        ) {
          message = error.error.responseBody;
        }

        // 尝试获取完整的错误信息
        try {
          fullError = JSON.stringify(error, null, 2);
        } catch (e) {
          fullError = String(error);
        }

        logger?.error('streamText error', {
          statusCode,
          message,
          fullError,
          errorType: error?.constructor?.name,
        });

        // 构建友好的错误消息
        let errorMessage = 'AI 请求失败';
        
        if (statusCode === 401) {
          errorMessage = 'API 密钥无效，请检查配置';
        } else if (statusCode === 429) {
          errorMessage = 'API 请求频率超限或余额不足';
        } else if (statusCode === 500) {
          errorMessage = 'AI 服务暂时不可用，请稍后重试';
        } else if (message) {
          errorMessage = message;
        } else if (statusCode) {
          errorMessage = `AI 请求失败 (错误码: ${statusCode})`;
        } else {
          errorMessage = 'AI 请求失败，请检查 API 密钥和网络连接';
        }

        // 抛出错误以便上层捕获
        throw new Error(errorMessage);
      },
      async onFinish({ response }) {
        // onFinish负责保存消息，中间件负责生成标题
        logger?.info(
          'onFinish, 保存消息到数据库，conversationId:' + conversationId
        );
        if (conversationId) {
          try {
            // 在 v5 中，response.messages 已经包含完整的消息历史（包括用户消息和助手回复）
            // 直接使用 response.messages，不需要手动合并
            await conversationRepo?.saveMessages(
              conversationId,
              response.messages
            );
          } catch (error) {
            console.error('保存消息失败:', error);
            // 不影响聊天流程，只记录错误
          }
        }
      },
    });
  }

  getModel(
    modelId: string,
    key: string,
    logger: IChatLogger | null = null
  ): LanguageModelV2 {
    if (!this.isModelSupported(modelId)) {
      throw new Error(`Unsupported Model: ${modelId}`);
    }

    const provider = this.getProvider(modelId);
    if (!provider) {
      throw new Error(`Unsupported Model: ${modelId}`);
    }

    let model: LanguageModelV2;
    switch (provider.type) {
      case ProviderType.DEEPSEEK:
        model = createDeepSeek({ apiKey: key })(modelId);
        break;
      case ProviderType.OPENAI:
        model = createOpenAI({ apiKey: key })(modelId);
        break;
      case ProviderType.ANTHROPIC:
        model = createAnthropic({ apiKey: key })(modelId);
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

  public getModelList(): IModel[] {
    const models: IModel[] = [];
    this.providers.forEach((provider) => {
      models.push(...provider.models);
    });

    return models;
  }

  private isModelSupported(modelId: string): boolean {
    return this.getModelList().some((model) => model.id === modelId);
  }

  public getProvider(modelId: string): IProvider | undefined {
    return this.providers.find((provider) =>
      provider.models.some((model) => model.id === modelId)
    );
  }

  public getDefaultProvider(): IProvider | undefined {
    return this.providers.find(
      (provider) => provider.type === ProviderType.DEEPSEEK
    );
  }

  public getDefaultModel(): IModel | undefined {
    const provider = this.getDefaultProvider();
    if (!provider) {
      return undefined;
    }

    return provider.models[0];
  }

  public makeMessageID(): string {
    return randomUUID();
  }
}
