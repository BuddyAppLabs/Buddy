/**
 * Cosy Framework Preload Script
 * This script is responsible for setting up the IPC bridge between the main and renderer processes.
 */
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../constants.js';
import { IPreloadApi } from '../contract/IPreloadApi.js';
import { IpcResponse } from '@coffic/buddy-types';

/**
 * The implementation of the Preload API that will be exposed to the renderer process.
 */
export const preloadApi: IPreloadApi = {
  send: (channel: string, ...args: unknown[]): void => {
    ipcRenderer.send(channel, ...args);
  },

  receive: (channel: string, callback: (...args: unknown[]) => void): void => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
  },

  removeListener: (
    channel: string,
    callback: (...args: unknown[]) => void
  ): void => {
    ipcRenderer.removeListener(channel, callback);
  },

  invoke: async (
    channel: string,
    ...args: unknown[]
  ): Promise<IpcResponse<any>> => {
    const response = await ipcRenderer.invoke(
      IPC_CHANNELS.DISPATCH,
      channel,
      args
    );

    try {
      return response as IpcResponse<any>;
    } catch (error: any) {
      throw new Error(`IPC Error: ${error?.message || error}`);
    }
  },
};

// Expose the API to the renderer process
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('ipc', preloadApi);
  } catch (error) {
    console.error('Failed to expose preload API:', error);
  }
} else {
  // For non-context-isolated environments (less secure)
  // @ts-ignore (define in dts)
  window.ipc = preloadApi;
}
