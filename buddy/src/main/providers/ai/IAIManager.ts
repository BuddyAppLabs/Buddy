import { IModel } from '@/main/service/chat/contract/IModel';
import { IProvider } from '@/main/service/chat/contract/IProvider';
import { AIModelType, IAIModelConfig } from '@coffic/buddy-it';
import { StreamTextResult, UIMessage } from 'ai';

/**
 * AI服务契约
 * 定义了AI管理器需要实现的方法
 */
export interface IAIManager {
  /**
   * 发送聊天消息
   * 返回流式响应
   */
  createStream(
    modelId: string,
    messages: UIMessage[]
  ): Promise<StreamTextResult<any, any>>;

  /**
   * 生成文本
   * @param prompt 提示词
   * @returns 文本
   */
  generateText(prompt: string): Promise<string>;

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
