/**
 * 预加载脚本入口文件
 * 整合所有模块并暴露给渲染进程
 */
import { contextBridge, ipcRenderer } from 'electron';
import { IpcResponse } from '@coffic/buddy-types';
import { IpcApi } from '@/types/ipc-api.js';

const logger = console;

const verbose = false;

export const ipcApi: IpcApi = {
    send: (channel: string, ...args: unknown[]): void => {
        ipcRenderer.send(channel, ...args);
    },

    receive: (channel: string, callback: (...args: unknown[]) => void): void => {
        if (verbose) {
            logger.info('====== 注册IPC监听器:', channel);
        }

        ipcRenderer.on(channel, (_, ...args) => callback(...args));
    },

    removeListener: (
        channel: string,
        callback: (...args: unknown[]) => void
    ): void => {
        ipcRenderer.removeListener(channel, callback);
    },

    invoke: async (channel: string, ...args: unknown[]): Promise<IpcResponse<any>> => {
        if (verbose) {
            logger.info('====== 调用IPC方法:', channel);
        }

        const response = await ipcRenderer.invoke('electron-laravel-framework:dispatch', channel, args);

        try {
            return response as IpcResponse<any>;
        } catch (error: any) {
            throw new Error("IPC通信出错", error)
        }
    },
};

// 使用 contextBridge 暴露 API 到渲染进程
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('ipc', ipcApi);
    } catch (error) {
        console.error(error);
    }
} else {
    // @ts-ignore (define in dts)
    window.ipc = ipcApi;
}
