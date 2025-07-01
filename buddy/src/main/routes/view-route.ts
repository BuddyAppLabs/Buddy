import { viewManager } from '../managers/ViewManager.js';
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { createViewArgs } from '@/types/args.js';
import { RouteFacade } from '@coffic/cosy-framework';

export function registerViewRoutes(): void {
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

  // 批量更新或插入视图
  RouteFacade.handle(
    IPC_METHODS.BATCH_UPSERT_VIEWS,
    (_event, viewsArgs: createViewArgs[]): Promise<void> => {
      return viewManager.batchUpsertViews(viewsArgs);
    }
  )
    .validation({
      '0': { required: true, type: 'array' },
    })
    .description('批量更新或插入多个视图');
}
