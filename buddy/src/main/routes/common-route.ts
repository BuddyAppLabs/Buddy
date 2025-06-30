/**
 * 通用功能路由
 * 处理基础的文件、视图操作等
 */

import { shell } from 'electron';
import { viewManager } from '../managers/ViewManager.js';
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { createViewArgs } from '@/types/args.js';
import { RouteFacade } from '@coffic/cosy-framework';
import { app } from 'electron';
import { fileIpc } from '../service/FileIpc';
import { UpdateFacade } from '@coffic/cosy-framework';
import { LogFacade } from '@coffic/cosy-logger';

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

  // 创建视图
  RouteFacade.handle(
    IPC_METHODS.Create_View,
    (_event, bounds): Promise<unknown> => {
      return viewManager.createView(bounds);
    }
  ).description('创建新的视图');

  // 销毁视图
  RouteFacade.handle(IPC_METHODS.Destroy_View, (_event, id): void => {
    return viewManager.destroyView(id);
  })
    .validation({
      '0': { required: true, type: 'string' },
    })
    .description('销毁指定的视图');

  // 销毁所有插件视图
  RouteFacade.handle(IPC_METHODS.Destroy_Plugin_Views, (_event): void => {
    return viewManager.destroyAllViews();
  }).description('销毁所有插件视图');

  // 更新视图边界
  RouteFacade.handle(
    IPC_METHODS.Update_View_Bounds,
    (_event, id, bounds): void => {
      return viewManager.updateViewPosition(id, bounds);
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
      '1': { required: true, type: 'object' },
    })
    .description('更新视图的位置和大小');

  // 更新或插入视图
  RouteFacade.handle(
    IPC_METHODS.UPSERT_VIEW,
    (_event, args: createViewArgs): Promise<void> => {
      return viewManager.upsertView(args);
    }
  )
    .validation({
      '0': { required: true, type: 'object' },
    })
    .description('更新或插入视图');

  // 打开配置文件夹
  RouteFacade.handle(IPC_METHODS.OPEN_CONFIG_FOLDER, async () => {
    await fileIpc.openConfigFolder();
  }).description('打开配置文件夹');

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
  RouteFacade.handle(IPC_METHODS.CHECK_UPDATE, () => {
    return UpdateFacade.checkForUpdates();
  }).description('检查更新');
}
