/**
 * AI 相关的 IPC 路由
 */
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { RouteFacade, LogFacade } from '@coffic/cosy-framework';
import { AIFacade } from '../providers/ai/AIFacade.js';
import type { UIMessage } from 'ai';

export function registerAIRoutes(): void {
  /**
   * 发送聊天消息（流式响应）
   */
  RouteFacade.handle(
    IPC_METHODS.AI_CHAT_SEND,
    async (event, model: string, messages: UIMessage[]) => {
      LogFacade.info('[AI Route] 收到聊天请求', {
        model,
        messageCount: messages.length,
      });

      try {
        LogFacade.info('[AI Route] 调用 AIFacade.createStream');
        const stream = await AIFacade.createStream(model, messages);
        LogFacade.info('[AI Route] Stream 创建成功');

        // 将流式响应转换为文本
        let fullText = '';
        let chunkCount = 0;

        // 使用 textStream 获取文本流
        LogFacade.info('[AI Route] 开始读取流式响应');
        for await (const textPart of stream.textStream) {
          chunkCount++;
          fullText += textPart;
          // 发送增量更新到渲染进程
          event.sender.send('ai-chat-stream', textPart);
          
          if (chunkCount % 10 === 0) {
            LogFacade.info(`[AI Route] 已发送 ${chunkCount} 个文本块`);
          }
        }

        LogFacade.info('[AI Route] 流式响应完成', {
          totalChunks: chunkCount,
          totalLength: fullText.length,
        });

        return {
          success: true,
          data: fullText,
        };
      } catch (error) {
        LogFacade.error('[AI Route] 发送聊天消息失败', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  /**
   * 获取可用的 AI 提供商
   */
  RouteFacade.handle(IPC_METHODS.AI_GET_PROVIDERS, async () => {
    try {
      const providers = AIFacade.getAvailableProviders();
      return {
        success: true,
        data: providers,
      };
    } catch (error) {
      console.error('[AI Route] Error getting providers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * 获取可用的模型列表
   */
  RouteFacade.handle(IPC_METHODS.AI_GET_MODELS, async () => {
    try {
      const models = AIFacade.getAvailableModels();
      return {
        success: true,
        data: models,
      };
    } catch (error) {
      console.error('[AI Route] Error getting models:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * 设置 API 密钥
   */
  RouteFacade.handle(
    IPC_METHODS.AI_SET_API_KEY,
    async (_event, provider: string, key: string) => {
      try {
        await AIFacade.setApiKey(provider, key);
        return {
          success: true,
          data: null,
        };
      } catch (error) {
        console.error('[AI Route] Error setting API key:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  /**
   * 获取 API 密钥
   */
  RouteFacade.handle(
    IPC_METHODS.AI_GET_API_KEY,
    async (_event, provider: string) => {
      try {
        const key = await AIFacade.getApiKey(provider);
        return {
          success: true,
          data: key || '',
        };
      } catch (error) {
        console.error('[AI Route] Error getting API key:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}
