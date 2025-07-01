import { v4 as uuidv4 } from 'uuid';
import {
  ChatMessage,
  IpcResponse,
  StreamChunkResponse,
} from '@coffic/buddy-types';
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { RouteFacade } from '@coffic/cosy-framework';
import { AIFacade } from '../providers/ai/AIFacade.js';
import { LogFacade } from '@coffic/cosy-logger';

/**
 * AI相关路由
 * 处理AI聊天和流式通信
 */
export function registerAIRoutes(): void {
  // 启动流式AI聊天会话
  RouteFacade.handle(
    IPC_METHODS.AI_CHAT_SEND,
    async (event, messages: ChatMessage[]): Promise<IpcResponse<string>> => {
      LogFacade.channel('ai').debug(`启动流式AI聊天: ${messages.length}条消息`);
      try {
        const requestId = uuidv4();
        LogFacade.channel('ai').debug(`生成请求ID: ${requestId}`);

        AIFacade.sendChatMessage(
          messages,
          (chunk: string) => {
            LogFacade.channel('ai').debug(`聊天数据块: ${chunk}`);
            event.sender.send(IPC_METHODS.AI_CHAT_STREAM_CHUNK, {
              success: true,
              data: chunk,
              requestId,
            } as StreamChunkResponse);
          },
          () => {
            LogFacade.channel('ai').debug(`聊天完成`);
            event.sender.send(IPC_METHODS.AI_CHAT_STREAM_DONE, {
              success: true,
              requestId,
            });
          },
          undefined,
          requestId
        );

        return {
          success: true,
          data: requestId,
        };
      } catch (error) {
        LogFacade.channel('ai').error(`启动流式AI聊天失败:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  )
    .validation({
      '0': {
        required: true,
        type: 'array',
        validator: (messages) => {
          return Array.isArray(messages) && messages.length > 0
            ? true
            : '消息列表不能为空';
        },
      },
    })
    .description('启动流式AI聊天会话');

  // 取消AI聊天请求
  RouteFacade.handle(
    IPC_METHODS.AI_CHAT_CANCEL,
    (_event, requestId: string, reason: string): IpcResponse<boolean> => {
      LogFacade.channel('ai').debug(
        `取消AI聊天请求: ${requestId}，原因是：${reason}`
      );
      try {
        const cancelled = AIFacade.cancelRequest(requestId);
        return { success: true, data: cancelled };
      } catch (error) {
        LogFacade.channel('ai').error(`取消AI聊天请求失败:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
      '1': { required: true, type: 'string' },
    })
    .description('取消AI聊天请求');

  // 设置AI提供商的API密钥
  RouteFacade.handle(
    IPC_METHODS.AI_SET_API_KEY,
    async (
      _event,
      provider: 'openai' | 'anthropic' | 'deepseek',
      key: string
    ): Promise<IpcResponse<void>> => {
      try {
        await AIFacade.setApiKey(provider, key);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  );

  // 获取可用的AI模型列表
  RouteFacade.handle(
    IPC_METHODS.AI_GET_AVAILABLE_MODELS,
    (): IpcResponse<Record<'openai' | 'anthropic' | 'deepseek', string[]>> => {
      try {
        const models = AIFacade.getAvailableModels();
        return { success: true, data: models };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  );

  // 获取默认模型配置
  RouteFacade.handle(IPC_METHODS.AI_GET_DEFAULT_MODEL, () => {
    try {
      const config = AIFacade.getDefaultModelConfig();
      return { success: true, data: config };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  // 设置默认模型配置
  RouteFacade.handle(
    IPC_METHODS.AI_SET_DEFAULT_MODEL,
    async (_event, config) => {
      try {
        await AIFacade.setDefaultModel(config);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  );
}
