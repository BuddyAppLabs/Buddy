/**
 * AI 相关的 IPC 路由
 */
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { RouteFacade, LogFacade } from '@coffic/cosy-framework';
import { AIFacade } from '../providers/ai/AIFacade.js';
import type { UIMessage } from 'ai';

const verbose = false;

export function registerAIRoutes(): void {
  /**
   * 发送聊天消息（流式响应）
   */
  RouteFacade.handle(
    IPC_METHODS.AI_CHAT_SEND,
    async (event, model: string, messages: UIMessage[]) => {
      if (verbose) {
        LogFacade.info('[AI Route] 收到聊天请求', {
          model,
          messageCount: messages.length,
          messages: JSON.stringify(messages),
        });
      }

      try {
        if (verbose) {
          LogFacade.info('[AI Route] 调用 AIFacade.createStream');
        }
        const stream = await AIFacade.createStream(model, messages);
        if (verbose) {
          LogFacade.info('[AI Route] Stream 创建成功');
        }

        // 使用 fullStream 获取完整的流（包括工具调用）
        let fullText = '';
        let chunkCount = 0;

        if (verbose) {
          LogFacade.info('[AI Route] 开始读取完整流式响应');
        }

        for await (const part of stream.fullStream) {
          chunkCount++;

          if (verbose) {
            LogFacade.info(`[AI Route] 收到数据块 #${chunkCount}:`, {
              type: part.type,
            });
          }

          // 处理不同类型的数据块
          switch (part.type) {
            case 'text-delta':
              // 文本增量
              fullText += part.text;
              event.sender.send('ai-chat-stream', part.text);
              break;

            case 'tool-call':
              // 工具调用
              console.log('[AI Route] 工具调用:', part.toolName, part.input);
              break;

            case 'tool-result':
              // 工具结果
              console.log('[AI Route] 工具结果:', part.toolName, part.output);
              break;

            case 'finish':
              // 流结束
              console.log('[AI Route] 流结束:', part.finishReason);
              break;
          }
        }

        if (verbose) {
          LogFacade.info('[AI Route] 流式响应完成', {
            totalChunks: chunkCount,
            totalLength: fullText.length,
          });
        }

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
      LogFacade.error('[AI Route] Error getting providers:', error);
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
        await AIFacade.setApiKey(provider as any, key);
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
        const key = await AIFacade.getApiKey(provider as any);
        // 确保返回的是字符串，处理可能的对象包装
        const keyString =
          typeof key === 'string' ? key : key ? String(key) : '';
        return {
          success: true,
          data: keyString,
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
