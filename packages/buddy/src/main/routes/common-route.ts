/**
 * 通用功能路由
 * 处理基础的文件、视图操作等
 */

import { shell } from 'electron';
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { RouteFacade } from '@coffic/cosy-framework';
import { app } from 'electron';
import { UpdateFacade } from '@coffic/cosy-framework';
import { LogFacade } from '@coffic/cosy-framework';

export function registerCommonRoutes(): void {
  // 打开文件夹
  RouteFacade.handle(
    IPC_METHODS.OPEN_FOLDER,
    (_event, directory: string): void => {
      // directory 必须是字符串
      if (typeof directory !== 'string') {
        throw new Error(`路径必须是字符串，当前类型为: ${typeof directory}`);
      }

      LogFacade.channel('app').info(`打开: ${directory}`);

      try {
        shell.openPath(directory);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(errorMessage);
      }
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
    })
    .description('打开指定的文件夹');

  // 获取版本信息
  RouteFacade.handle(IPC_METHODS.GET_VERSIONS, () => {
    return {
      app: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      v8: process.versions.v8,
    };
  }).description('获取应用和运行时版本信息');

  // 检查更新
  RouteFacade.handle(IPC_METHODS.CHECK_UPDATE, async (): Promise<string> => {
    return await UpdateFacade.checkForUpdates();
  }).description('检查更新');
}
