import { ChatMessage } from '@coffic/buddy-types';
import { IAIManager, AIModelType } from './IAIManager.js';
import { IAIModelConfig } from './IAIModelConfig.js';

/**
 * AI管理器
 * 对主应用中的AIManager进行封装，提供统一的AI服务接口
 * 实现Foundation的服务模式
 */
export class AIManager implements IAIManager {
  /**
   * 检查是否已初始化
   */
  private ensureInitialized(): void {}

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
    throw new Error('Not implemented');
  }

  /**
   * 取消指定ID的请求
   */
  public cancelRequest(requestId: string): boolean {
    throw new Error('Not implemented');
  }

  /**
   * 设置默认模型配置
   */
  public setDefaultModel(config: Partial<IAIModelConfig>): void {
    throw new Error('Not implemented');
  }

  /**
   * 获取默认模型配置
   */
  public getDefaultModelConfig(): IAIModelConfig {
    throw new Error('Not implemented');
  }

  /**
   * 获取支持的模型列表
   */
  public getAvailableModels(): { [key in AIModelType]: string[] } {
    throw new Error('Not implemented');
  }

  /**
   * 重置配置
   */
  public resetConfig(): void {}
}
