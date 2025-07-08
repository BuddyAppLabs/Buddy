import { AIModelType, IAIModelConfig } from '@coffic/buddy-it';
import { IAIManager } from './IAIManager.js';
import { ILogManager, SettingFacade } from '@coffic/cosy-framework';
import { StreamTextResult, UIMessage } from 'ai';
import { ChatService } from '@/main/service/chat/ChatService.js';
import { IModel } from '@/main/service/chat/contract/IModel.js';
import { IProvider } from '@/main/service/chat/contract/IProvider.js';

const DEFAULT_OPENAI_MODEL = 'gpt-4o';

/**
 * AI管理器
 * 对主应用中的AIManager进行封装，提供统一的AI服务接口
 * 实现Foundation的服务模式
 */
export class AIManager implements IAIManager {
  private activeRequests = new Map<string, AbortController>();
  private chatService: ChatService;
  private logger: ILogManager;
  private modelConfig: IAIModelConfig;

  constructor(logger: ILogManager) {
    this.logger = logger;
    this.chatService = new ChatService(
      undefined,
      '你是AI助手，请根据用户的问题给出回答',
      logger
    );

    this.modelConfig = this.getDefaultModelConfig();
    this.loadDefaultModelConfig();
  }

  private async loadDefaultModelConfig() {
    const savedConfig = SettingFacade.get<IAIModelConfig>('ai.defaultModel');
    if (savedConfig) {
      this.modelConfig = savedConfig;
      this.logger.info('已加载保存的默认模型配置', {
        defaultModelConfig: this.modelConfig,
      });
    }
  }

  /**
   * 发送聊天消息
   * 返回流式响应
   */
  public async createStream(
    modelId: string,
    messages: UIMessage[]
  ): Promise<StreamTextResult<any, any>> {
    const modelApiKey = await this.getModelApiKey(modelId);
    if (!modelApiKey) {
      throw new Error('Model key not found');
    }

    return this.chatService.createStream(modelId, modelApiKey, messages);
  }

  /**
   * 生成文本
   * @param prompt 提示词
   * @returns 文本
   */
  public async generateText(prompt: string): Promise<string> {
    const model = this.chatService.getDefaultModel();
    if (!model) {
      return '没有默认模型';
    }

    const modelApiKey = await this.getModelApiKey(model.id);
    if (!modelApiKey) {
      throw new Error('Model key not found');
    }

    const result = await this.chatService.generateText(
      model.id,
      modelApiKey,
      prompt
    );

    return result;
  }

  /**
   * 取消指定ID的请求
   */
  public cancelRequest(requestId: string): boolean {
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
      return true;
    }
    return false;
  }

  /**
   * 设置默认模型配置
   */
  public async setDefaultModel(config: Partial<IAIModelConfig>): Promise<void> {
    const newConfig = { ...this.modelConfig, ...config };
    this.modelConfig = newConfig;
    await SettingFacade.set('ai.defaultModel', newConfig);
  }

  /**
   * 获取默认模型配置
   */
  public getDefaultModelConfig(): IAIModelConfig {
    const model = this.chatService.getDefaultModel();
    if (!model) {
      return {
        type: 'openai',
        modelName: DEFAULT_OPENAI_MODEL,
        apiKey: '',
      };
    }

    return {
      type: model.provider as AIModelType,
      modelName: model.id,
      apiKey: '',
    };
  }

  /**
   * 获取支持的供应商列表
   */
  public getAvailableProviders(): IProvider[] {
    return this.chatService.providers;
  }

  /**
   * 获取支持的模型列表
   */
  public getAvailableModels(): IModel[] {
    return this.chatService.getModelList();
  }

  /**
   * 重置配置
   */
  public async resetConfig(): Promise<void> {
    this.modelConfig = this.getDefaultModelConfig();
    await SettingFacade.remove('ai.defaultModel');
    await SettingFacade.remove('ai.keys.openai');
    await SettingFacade.remove('ai.keys.anthropic');
    await SettingFacade.remove('ai.keys.deepseek');
  }

  /**
   * 设置指定AI提供商的API密钥
   */
  public async setApiKey(provider: AIModelType, key: string): Promise<void> {
    await SettingFacade.set(`ai.keys.${provider}`, key);
  }

  /**
   * 获取指定AI提供商的API密钥
   */
  public async getApiKey(provider: AIModelType): Promise<string | undefined> {
    return SettingFacade.get<string>(`ai.keys.${provider}`);
  }

  /**
   * 获取指定大模型的API密钥
   */
  public async getModelApiKey(modelId: string): Promise<string | undefined> {
    const provider = this.chatService.getProvider(modelId)?.type;

    if (!provider) {
      return undefined;
    }

    return this.getApiKey(provider); // 获取模型对应的提供商的API密钥
  }
}
