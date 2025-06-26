/**
 * 应用状态相关路由
 * 处理当前应用状态、覆盖应用等功能
 */

import { Route } from '@coffic/buddy-foundation';
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { appStateManager } from '../managers/StateManager.js';

// 获取当前覆盖的应用
Route.handle(IPC_METHODS.Get_Current_App, (_event) => {
    return appStateManager.getOverlaidApp();
})
    .description('获取当前被覆盖的应用信息'); 