import { IPC_METHODS } from '@/types/ipc-methods';

const ipc = window.ipc;

export const aiIpc = {
  /**
   * 发送聊天消息
   */
  async sendMessage(model: string, messages: any[]) {
    return await ipc.invoke(IPC_METHODS.AI_CHAT_SEND, model, messages);
  },

  /**
   * 获取可用的 AI 提供商
   */
  async getProviders() {
    return await ipc.invoke(IPC_METHODS.AI_GET_PROVIDERS);
  },

  /**
   * 获取可用的模型列表
   */
  async getModels() {
    return await ipc.invoke(IPC_METHODS.AI_GET_MODELS);
  },

  /**
   * 设置 API 密钥
   */
  async setApiKey(provider: string, key: string) {
    return await ipc.invoke(IPC_METHODS.AI_SET_API_KEY, provider, key);
  },

  /**
   * 获取 API 密钥
   */
  async getApiKey(provider: string) {
    return await ipc.invoke(IPC_METHODS.AI_GET_API_KEY, provider);
  },
};
