import { ChatMessage, IAIModelConfig } from '@coffic/buddy-types';
import { IAIManager, AIModelType } from './IAIManager.js';
import { SettingFacade } from '@coffic/cosy-framework';
import { CoreMessage, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { LogFacade } from '@coffic/cosy-logger';

const DEFAULT_OPENAI_MODEL = 'gpt-4o';
/**
 * AI管理器
 * 对主应用中的AIManager进行封装，提供统一的AI服务接口
 * 实现Foundation的服务模式
 */
export class AIManager implements IAIManager {
  private activeRequests = new Map<string, AbortController>();

  private defaultModelConfig: IAIModelConfig = {
    type: 'openai',
    modelName: DEFAULT_OPENAI_MODEL,
    apiKey: '',
  };

  constructor() {
    this.loadDefaultModelConfig();
  }

  private async loadDefaultModelConfig() {
    const savedConfig = SettingFacade.get<IAIModelConfig>('ai.defaultModel');
    if (savedConfig) {
      this.defaultModelConfig = savedConfig;
      LogFacade.channel('ai').info(
        '已加载保存的默认模型配置:',
        this.defaultModelConfig
      );
    }
  }
  /**
   * 发送聊天消息
   * 返回流式响应
   */
  public async sendChatMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onFinish: () => void,
    modelConfig?: Partial<IAIModelConfig>,
    requestId?: string
  ): Promise<void> {
    const config = { ...this.defaultModelConfig, ...modelConfig };
    const apiKey = await this.getApiKey(config.type);

    if (!apiKey) {
      const toolCallPayload = {
        type: 'tool-call',
        toolCall: {
          toolCallId: `tool_call_${requestId}`,
          toolName: 'require_api_key',
          args: { provider: config.type },
        },
      };

      onChunk(JSON.stringify(toolCallPayload));
      onFinish();
      return;
    }

    const abortController = new AbortController();
    const id = requestId || Math.random().toString(36).substring(2, 15);
    this.activeRequests.set(id, abortController);

    try {
      let provider;
      switch (config.type) {
        case 'openai':
          provider = createOpenAI({
            apiKey: apiKey,
          });
          break;
        case 'anthropic':
          // a holder for anthropic
          throw new Error('Anthropic not implemented');
        case 'deepseek':
          // a holder for deepseek
          throw new Error('Deepseek not implemented');
        default:
          throw new Error(`不支持的模型类型: ${config.type}`);
      }

      const result = await streamText({
        model: provider(config.modelName),
        messages: messages as CoreMessage[],
        system: config.system,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        onFinish: onFinish,
        abortSignal: abortController.signal,
      });

      for await (const chunk of result.textStream) {
        onChunk(chunk);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        LogFacade.channel('ai').info(`请求 ${id} 已被用户取消`);
      } else {
        LogFacade.channel('ai').error(`AI聊天出错:`, error);
        throw error; // rethrow to be handled by the caller
      }
    } finally {
      this.activeRequests.delete(id);
    }
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
    const newConfig = { ...this.defaultModelConfig, ...config };
    this.defaultModelConfig = newConfig;
    await SettingFacade.set('ai.defaultModel', newConfig);
  }

  /**
   * 获取默认模型配置
   */
  public getDefaultModelConfig(): IAIModelConfig {
    return this.defaultModelConfig;
  }

  /**
   * 获取支持的模型列表
   */
  public getAvailableModels(): { [key in AIModelType]: string[] } {
    return {
      openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
      anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
      deepseek: ['deepseek-chat', 'deepseek-coder'],
    };
  }

  /**
   * 重置配置
   */
  public async resetConfig(): Promise<void> {
    this.defaultModelConfig = {
      type: 'openai',
      modelName: DEFAULT_OPENAI_MODEL,
      apiKey: '',
    };
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
    const provider = 'deepseek';

    return this.getApiKey(provider); // 获取模型对应的提供商的API密钥
  }
}
