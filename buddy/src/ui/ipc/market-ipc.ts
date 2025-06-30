import { SendablePlugin } from '@/types/sendable-plugin';
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { logger } from '../utils/logger.js';

const ipc = window.ipc;

export const marketIpc = {
  // 获取用户插件列表
  async getUserPlugins(): Promise<SendablePlugin[]> {
    let response = await ipc.invoke(IPC_METHODS.GET_USER_PLUGINS);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },

  // 获取开发插件列表
  async getDevPlugins(): Promise<SendablePlugin[]> {
    let response = await ipc.invoke(IPC_METHODS.GET_DEV_PLUGINS);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },

  // 获取用户插件目录
  async getUserPluginDirectory(): Promise<string> {
    let response = await ipc.invoke(IPC_METHODS.GET_PLUGIN_DIRECTORIES);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },

  // 下载插件
  async downloadPlugin(pluginId: string): Promise<void> {
    let response = await ipc.invoke(IPC_METHODS.DOWNLOAD_PLUGIN, pluginId);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },

  // 卸载插件
  async uninstallPlugin(pluginId: string): Promise<void> {
    let response = await ipc.invoke(IPC_METHODS.UNINSTALL_PLUGIN, pluginId);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },

  // 获取远程插件列表
  async getRemotePlugins(): Promise<SendablePlugin[]> {
    console.log('getRemotePlugins');
    let response = await ipc.invoke(IPC_METHODS.GET_REMOTE_PLUGINS);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },

  // 创建插件视图
  async createPluginView(pluginId: string): Promise<void> {
    let response = await ipc.invoke(IPC_METHODS.CREATE_PLUGIN_VIEW, pluginId);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },

  // 获取开发插件目录
  async getDevPluginDirectory(): Promise<string> {
    let response = await ipc.invoke(IPC_METHODS.GET_DEV_PLUGIN_DIRECTORY);
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },

  // 设置开发插件目录
  async setDevPluginDirectory(): Promise<string | null> {
    let response = await ipc.invoke(IPC_METHODS.SET_DEV_PLUGIN_DIRECTORY);
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },

  // 判断某个插件是否已经安装
  async isInstalled(pluginId: string): Promise<boolean> {
    logger.debug('判断插件是否已经安装', pluginId);

    let response = await ipc.invoke(IPC_METHODS.Plugin_Is_Installed, pluginId);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },
};
