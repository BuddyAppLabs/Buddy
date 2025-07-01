/**
 * AI服务契约
 * 定义了AI管理器需要实现的方法
 */

import { IAIModelConfig, ChatMessage } from '@coffic/buddy-types';

// AI模型类型
export type AIModelType = 'openai' | 'anthropic' | 'deepseek';

export interface IAIManager {
  /**
   * 发送聊天消息
   * 返回流式响应
   */
  sendChatMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onFinish: () => void,
    modelConfig?: Partial<IAIModelConfig>,
    requestId?: string
  ): Promise<void>;

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
   * 获取支持的模型列表
   */
  getAvailableModels(): { [key in AIModelType]: string[] };

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
}
