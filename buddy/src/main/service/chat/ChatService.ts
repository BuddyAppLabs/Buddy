import { streamText, appendResponseMessages } from 'ai';
import { getTools } from './tools';
import type {
  CoreMessage,
  LanguageModelV1,
  StreamTextResult,
  UIMessage,
} from 'ai';
import type { IChatLogger } from './contract/IChatLogger.js';
import type { IConversationRepo } from './contract/IConversationRepo.js';
import { ModelService } from './ModelService';
const ALL_PROVIDER_NAMES = ['deepseek', 'openai'] as const;

export type ProviderName = (typeof ALL_PROVIDER_NAMES)[number];

export const providerNames: ProviderName[] = [...ALL_PROVIDER_NAMES];

export class ChatService {
  private conversationRepo: IConversationRepo | null = null;
  private logger: IChatLogger | null = null;
  private systemPrompt: string | null = null;
  private modelService: ModelService;

  constructor(
    conversationRepo?: IConversationRepo,
    systemPrompt?: string,
    logger?: IChatLogger
  ) {
    this.conversationRepo = conversationRepo ?? null;
    this.logger = logger ?? null;
    this.systemPrompt = systemPrompt ?? null;
    this.modelService = new ModelService();
  }

  createStream(
    modelId: string,
    key: string,
    messages: UIMessage[],
    user?: any,
    conversationId?: string
  ): StreamTextResult<any, any> {
    let model = this.getModel(modelId, key);
    const conversationRepo = this.conversationRepo;
    const logger = this.logger;

    return streamText({
      model: model,
      system: this.systemPrompt ?? '',
      messages,
      tools: getTools(user),
      toolCallStreaming: true,
      onError: (error) => {
        let statusCode: any;
        let message: any;

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

        logger?.error('streamText error', { statusCode, message });
        throw error;
      },
      async onFinish({ response }) {
        // onFinish负责保存消息，中间件负责生成标题
        logger?.info(
          'onFinish, 保存消息到数据库，conversationId:' + conversationId
        );
        if (conversationId) {
          try {
            const updatedMessages = appendResponseMessages({
              messages,
              responseMessages: response.messages,
            });

            await conversationRepo?.saveMessages(
              conversationId,
              updatedMessages
            );
          } catch (error) {
            console.error('保存消息失败:', error);
            // 不影响聊天流程，只记录错误
          }
        }
      },
    });
  }

  getModel(modelId: string, key: string): LanguageModelV1 {
    return this.modelService.getModel(modelId, key, this.logger);
  }

  getModelList() {
    return this.modelService.getModelList();
  }
}
