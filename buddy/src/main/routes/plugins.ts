/**
 * 插件相关路由
 */

import { RouteFacade } from '@coffic/buddy-foundation';
import { pluginManager } from '../managers/PluginManager.js';

export function registerPluginRoutes(): void {
    // 获取插件列表
    RouteFacade.handle('plugins/actions', async () => {
        const plugins = await pluginManager.getPlugins();
        return { success: true, data: plugins };
    })
        .description('获取所有插件的动作列表');

    // 获取插件目录
    RouteFacade.handle('plugins/directories', async () => {
        // TODO: 实现获取插件目录的逻辑
        return { success: true, data: [] };
    })
        .description('获取插件目录列表');

    // 获取插件存储
    RouteFacade.handle('plugins/store', async () => {
        // TODO: 实现获取插件存储的逻辑
        return { success: true, data: {} };
    })
        .description('获取插件存储信息');

    // 获取开发中的插件
    RouteFacade.handle('plugins/dev', async () => {
        // TODO: 实现获取开发中插件的逻辑
        return { success: true, data: [] };
    })
        .description('获取开发中的插件列表');

    // 获取远程插件
    RouteFacade.handle('plugins/remote', async () => {
        // TODO: 实现获取远程插件的逻辑
        return { success: true, data: [] };
    })
        .description('获取远程插件列表');
} 