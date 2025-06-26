/**
 * 应用更新相关路由
 * 处理应用更新检查等功能
 */

import { Route } from '@coffic/buddy-foundation';
import { BrowserWindow } from 'electron';
import { updateManager } from '../managers/UpdateManager.js';

export function registerUpdateRoutes(): void {

    // 检查更新
    Route.handle('update:check', async (_event): Promise<void> => {
        updateManager.checkForUpdates();
    })
        .description('检查应用更新');

    // // 向所有窗口发送更新事件的工具函数
    // export const sendUpdateEvent = (event: string, data: any): void => {
    //     BrowserWindow.getAllWindows().forEach((window) => {
    //         if (!window.isDestroyed()) {
    //             window.webContents.send('update:event', event, data);
    //         }
    //     });
    // }
}