import {
  IpcResponse,
  StreamChunkResponse,
  StreamDoneResponse,
  ChatMessage,
  IAIModelConfig,
  AIModelType,
} from '@coffic/buddy-types';
import { IPC_METHODS } from '@/types/ipc-methods.js';

const ipc = window.ipc;

export const aiIpc = {
  /**
   * 发送AI聊天消息
   */
  async send(
    messages: ChatMessage[],
    modelConfig: Partial<Pick<IAIModelConfig, 'modelName' | 'type'>>
  ): Promise<string> {
    const response: IpcResponse<string> = await ipc.invoke(
      IPC_METHODS.AI_CHAT_SEND,
      messages,
      modelConfig
    );
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error ?? 'Failed to send message');
    }
  },

  /**
   * 监听AI聊天流数据块
   */
  onAiChatStreamChunk(
    callback: (response: StreamChunkResponse) => void
  ): () => void {
    const handler = (response: any) => {
      callback(response as StreamChunkResponse);
    };

    ipc.receive(IPC_METHODS.AI_CHAT_STREAM_CHUNK, handler);

    return () => {
      ipc.removeListener(IPC_METHODS.AI_CHAT_STREAM_CHUNK, handler);
    };
  },

  /**
   * 监听AI聊天完成
   */
  onAiChatStreamDone(
    callback: (response: StreamDoneResponse) => void
  ): () => void {
    const handler = (response: any) => {
      callback(response as StreamDoneResponse);
    };

    ipc.receive(IPC_METHODS.AI_CHAT_STREAM_DONE, handler);

    return () => {
      ipc.removeListener(IPC_METHODS.AI_CHAT_STREAM_DONE, handler);
    };
  },

  /**
   * 取消AI聊天
   */
  async aiChatCancel(requestId: string, reason: string): Promise<boolean> {
    const response: IpcResponse<boolean> = await ipc.invoke(
      IPC_METHODS.AI_CHAT_CANCEL,
      requestId,
      reason
    );
    return response.success && !!response.data;
  },

  /**
   * 获取可用的AI模型
   */
  async getAvailableModels(): Promise<
    Record<'openai' | 'anthropic' | 'deepseek', string[]>
  > {
    const response: IpcResponse<any> = await ipc.invoke(
      IPC_METHODS.AI_GET_AVAILABLE_MODELS
    );
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to get available models');
  },

  /**
   * 设置指定AI提供商的API密钥
   */
  async setApiKey(provider: AIModelType, key: string): Promise<void> {
    const response: IpcResponse<void> = await ipc.invoke(
      IPC_METHODS.AI_SET_API_KEY,
      provider,
      key
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to set API key');
    }
  },
};
