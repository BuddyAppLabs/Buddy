import { AIModelType, IAIModelConfig } from '@coffic/buddy-it';
import { IAIManager } from './IAIManager.js';
import { ILogManager, SettingFacade } from '@coffic/cosy-framework';
import { UIMessage } from 'ai';
import { ChatService, type ProviderInfo } from '@/main/service/chat/index.js';

const DEFAULT_OPENAI_MODEL = 'gpt-4o';

/**
 * AI管理器
 * 对主应用中的AIManager进行封装，提供统一的AI服务接口
 * 实现Foundation的服务模式
 */
export class AIManager implements IAIManager {
  private chatService: ChatService;
  private logger: ILogManager;
  private modelConfig: IAIModelConfig;

  constructor(logger: ILogManager) {
    this.logger = logger;
    this.chatService = new ChatService();

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
   * 获取默认模型配置
   */
  public getDefaultModelConfig(): IAIModelConfig {
    return {
      type: 'openai',
      modelName: DEFAULT_OPENAI_MODEL,
      apiKey: '',
    };
  }

  /**
   * 获取支持的供应商列表
   */
  public getAvailableProviders(): ProviderInfo[] {
    const providers = ChatService.getAllProvidersWithMetadata();
    console.log(
      '[AIManager] getAvailableProviders:',
      providers.map((p) => p.type)
    );
    return providers;
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
    await SettingFacade.remove('ai.keys.openrouter');
    await SettingFacade.remove('ai.keys.megallm');
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
    // 从模型ID提取供应商名称（格式: provider/model-name）
    const [provider] = modelId.split('/');
    if (!provider) {
      return undefined;
    }

    return this.getApiKey(provider as AIModelType);
  }

  /**
   * 发送聊天消息
   * 返回流式响应
   */
  public async createStream(
    modelId: string,
    messages: UIMessage[]
  ): Promise<any> {
    console.log('[AIManager] createStream 开始', {
      modelId,
      messageCount: messages?.length,
    });
    console.log(
      '[AIManager] createStream 接收到的消息:',
      JSON.stringify(messages)
    );
    console.log(
      '[AIManager] 消息类型:',
      typeof messages,
      Array.isArray(messages)
    );

    const apiKey = await this.getModelApiKey(modelId);
    if (!apiKey) {
      throw new Error(`未找到模型 ${modelId} 的 API 密钥`);
    }

    // 从 modelId 中提取 provider 和实际的模型名称
    // modelId 格式: provider/model-name (例如: deepseek/deepseek-chat)
    const parts = modelId.split('/');
    const provider = parts[0];
    const actualModelName = parts.slice(1).join('/'); // 支持模型名称中包含 /

    console.log('[AIManager] 解析后的参数:', {
      原始modelId: modelId,
      provider,
      actualModelName,
      messageCount: messages?.length,
    });

    return this.chatService.createStream({
      provider: provider as any,
      modelName: actualModelName,
      key: apiKey,
      messages,
      systemPrompt: '你是AI助手，请根据用户的问题给出回答',
    });
  }

  /**
   * 生成文本
   */
  public async generateText(prompt: string): Promise<string> {
    // 使用当前选择的模型或默认模型
    const selection = await this.getSelectedModel();
    const modelId = selection?.model || `openai/${DEFAULT_OPENAI_MODEL}`;

    console.log('[AIManager] generateText 开始', {
      modelId,
      prompt: prompt.substring(0, 100),
    });

    const apiKey = await this.getModelApiKey(modelId);
    if (!apiKey) {
      throw new Error(`未找到模型 ${modelId} 的 API 密钥`);
    }

    // 从 modelId 中提取 provider 和实际的模型名称
    // modelId 格式: provider/model-name (例如: openrouter/openai/gpt-oss-20b:free)
    const parts = modelId.split('/');
    const provider = parts[0];
    const actualModelName = parts.slice(1).join('/'); // 支持模型名称中包含 /

    console.log('[AIManager] generateText 解析后的参数:', {
      原始modelId: modelId,
      provider,
      actualModelName,
    });

    // 构建消息
    const messages: UIMessage[] = [
      {
        id: Date.now().toString(),
        role: 'user',
        parts: [{ type: 'text', text: prompt }],
      },
    ];

    return this.chatService.generateText({
      provider: provider as any,
      modelName: actualModelName,
      key: apiKey,
      messages,
      systemPrompt: '你是AI助手，请根据用户的问题给出回答',
    });
  }

  /**
   * 取消指定ID的请求
   */
  public cancelRequest(requestId: string): boolean {
    // 新的ChatService不支持请求取消，返回false
    console.warn(`cancelRequest 方法不支持: ${requestId}`);
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
   * 获取支持的模型列表
   */
  public getAvailableModels(): any[] {
    const providers = ChatService.getSupportedProvidersAndModels();
    return providers.flatMap((p) =>
      p.models.map((m) => ({
        id: `${p.provider_name}/${m}`,
        name: m,
        provider: p.provider_name,
      }))
    );
  }

  /**
   * 设置用户选择的模型
   */
  public async setSelectedModel(
    provider: string,
    model: string
  ): Promise<void> {
    await SettingFacade.set('ai.selectedModel', {
      provider,
      model,
    });
    this.logger.info('已保存用户选择的模型', { provider, model });
  }

  /**
   * 获取用户选择的模型
   */
  public async getSelectedModel(): Promise<{
    provider: string;
    model: string;
  } | null> {
    const selection = SettingFacade.get<{
      provider: string;
      model: string;
    }>('ai.selectedModel');
    return selection || null;
  }
}
