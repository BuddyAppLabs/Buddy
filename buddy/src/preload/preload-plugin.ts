import { PluginIpc } from '@coffic/buddy-types';
import { contextBridge, ipcRenderer } from 'electron';

declare global {
  interface Window {
    buddy: PluginIpc;
  }
}

// 提供给插件视图的API
const pluginViewAPI: PluginIpc = {
  logger: {
    info: (...args: any[]) => {
      ipcRenderer.send('plugin:log', 'info', ...args);
    },
    warn: (...args: any[]) => {
      ipcRenderer.send('plugin:log', 'warn', ...args);
    },
    error: (...args: any[]) => {
      ipcRenderer.send('plugin:log', 'error', ...args);
    },
  },
};

// 暴露API到插件视图全局环境
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('buddy', pluginViewAPI);
  } catch (error) {
    console.error('暴露插件API到全局环境失败:', error);
  }
} else {
  window.buddy = pluginViewAPI;
}

console.log('preload-plugin.ts', window.buddy);
