import { IPC_METHODS } from '@/types/ipc-methods';

const ipc = window.ipc;

export const configIpc = {
  /**
   * 打开配置文件夹
   */
  async openConfigFolder() {
    return await ipc.invoke(IPC_METHODS.OPEN_CONFIG_FOLDER);
  },

  /**
   * 获取配置文件夹路径
   */
  async getConfigPath() {
    return await ipc.invoke(IPC_METHODS.CONFIG_GET_PATH);
  },

  /**
   * 获取所有配置
   */
  async getAllConfig() {
    return await ipc.invoke(IPC_METHODS.CONFIG_GET_ALL);
  },

  /**
   * 获取指定配置
   */
  async getConfig(key: string, defaultValue?: any) {
    return await ipc.invoke(IPC_METHODS.CONFIG_GET, key, defaultValue);
  },

  /**
   * 设置配置
   */
  async setConfig(key: string, value: any) {
    return await ipc.invoke(IPC_METHODS.CONFIG_SET, key, value);
  },

  /**
   * 删除配置
   */
  async deleteConfig(key: string) {
    return await ipc.invoke(IPC_METHODS.CONFIG_DELETE, key);
  },

  /**
   * 重新加载配置
   */
  async resetConfig() {
    return await ipc.invoke(IPC_METHODS.CONFIG_RESET);
  },
};
