/**
 * AI服务契约
 * 定义了AI管理器需要实现的方法
 */

import { IModel } from '@/main/service/chat/contract/IModel';
import { IProvider } from '@/main/service/chat/contract/IProvider';
import { IAIModelConfig } from '@coffic/buddy-types';
import { StreamTextResult, UIMessage } from 'ai';

// AI模型类型
export type AIModelType = 'openai' | 'anthropic' | 'deepseek';

export interface IAIManager {
  /**
   * 发送聊天消息
   * 返回流式响应
   */
  createStream(
    modelId: string,
    apiKey: string,
    messages: UIMessage[]
  ): Promise<StreamTextResult<any, any>>;

  /**
   * 取消指定ID的请求
   */
  cancelRequest(requestId: string): boolean;

  /**
   * 设置默认模型配置
   */
  setDefaultModel(config: Partial<IAIModelConfig>): void;

  /**
   * 获取默认模型配置
   */
  getDefaultModelConfig(): IAIModelConfig;

  /**
   * 获取支持的供应商列表
   */
  getAvailableProviders(): IProvider[];

  /**
   * 获取支持的模型列表
   */
  getAvailableModels(): IModel[];

  /**
   * 重置配置
   */
  resetConfig(): void;

  /**
   * 设置指定AI提供商的API密钥
   * @param provider AI提供商
   * @param key API密钥
   */
  setApiKey(provider: AIModelType, key: string): Promise<void>;

  /**
   * 获取指定AI提供商的API密钥
   * @param provider AI提供商
   */
  getApiKey(provider: AIModelType): Promise<string | undefined>;

  /**
   * 获取指定大模型的API密钥
   * @param modelId 大模型ID
   */
  getModelApiKey(modelId: string): Promise<string | undefined>;
}
