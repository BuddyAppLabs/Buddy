/**
 * 应用状态相关路由
 * 处理当前应用状态、覆盖应用等功能
 */

import { RouteFacade } from '@coffic/cosy-framework';
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { appStateManager } from '../providers/state/StateManager.js';

export function registerStateRoutes(): void {
  // 获取当前覆盖的应用
  RouteFacade.handle(IPC_METHODS.Get_Current_App, (_event) => {
    return appStateManager.getOverlaidApp();
  }).description('获取当前被覆盖的应用信息');
}
