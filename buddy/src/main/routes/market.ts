/**
 * 插件市场相关路由
 * 处理插件的安装、卸载、查询等功能
 */

import { remotePluginDB } from '../repo/PluginRepoRemote.js';
import { SendablePlugin } from '@/types/sendable-plugin.js';
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { RouteFacade } from '@coffic/cosy-framework';
import { Market } from '../providers/market/index.js';
import { devPluginDB, userPluginDB } from '../providers/plugin/index.js';

export function registerMarketRoutes(): void {
    // 检查插件是否已安装
    RouteFacade.handle(IPC_METHODS.Plugin_Is_Installed, async (_event, pluginId: string): Promise<boolean> => {
        return await userPluginDB.has(pluginId);
    })
        .validation({
            '0': { required: true, type: 'string' }
        })
        .description('检查指定插件是否已安装');

    // 获取用户插件列表
    RouteFacade.handle(IPC_METHODS.GET_USER_PLUGINS, async (_event): Promise<SendablePlugin[]> => {
        return await userPluginDB.getSendablePlugins();
    })
        .description('获取用户已安装的插件列表');

    // 获取开发插件列表
    RouteFacade.handle(IPC_METHODS.GET_DEV_PLUGINS, async (_event): Promise<SendablePlugin[]> => {
        return await devPluginDB.getSendablePlugins();
    })
        .description('获取开发环境的插件列表');

    // 获取远程插件列表
    RouteFacade.handle(IPC_METHODS.GET_REMOTE_PLUGINS, async (_event): Promise<SendablePlugin[]> => {
        return await remotePluginDB.getSendablePlugins();
    })
        .description('获取远程可下载的插件列表');

    // 下载/安装插件
    RouteFacade.handle(IPC_METHODS.DOWNLOAD_PLUGIN, async (_event, pluginId: string): Promise<void> => {
        await Market.install(pluginId);
    })
        .validation({
            '0': { required: true, type: 'string' }
        })
        .description('下载并安装指定的插件');

    // 获取插件目录路径
    RouteFacade.handle(IPC_METHODS.GET_PLUGIN_DIRECTORIES, (_event): string => {
        return userPluginDB.getRootDir();
    })
        .description('获取用户插件存储目录路径');

    // 卸载插件
    RouteFacade.handle(IPC_METHODS.UNINSTALL_PLUGIN, async (_event, pluginId: string): Promise<void> => {
        await Market.uninstall(pluginId);
    })
        .validation({
            '0': { required: true, type: 'string' }
        })
        .description('卸载指定的插件');
}