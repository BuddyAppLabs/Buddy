/**
 * AI服务契约
 * 定义了AI管理器需要实现的方法
 */

import { AIModelConfig, ChatMessage } from '@coffic/buddy-types';
import { IAIModelConfig } from './IAIModelConfig';

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
    modelConfig?: Partial<AIModelConfig>,
    requestId?: string
  ): Promise<void>;

  /**
   * 取消指定ID的请求
   */
  cancelRequest(requestId: string): boolean;

  /**
   * 设置默认模型配置
   */
  setDefaultModel(config: Partial<AIModelConfig>): void;

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
}
