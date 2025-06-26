/**
 * 插件动作相关路由
 * 处理插件动作的查询和执行
 */

import { Route } from '@coffic/buddy-foundation';
import { IpcResponse, SuperAction } from '@coffic/buddy-types';
import { actionManager } from '../managers/ActionManager.js';
import { pluginManager } from '../managers/PluginManager.js';
import { IPC_METHODS } from '@/types/ipc-methods.js';

const logger = console;

// 获取插件动作列表
Route.handle(IPC_METHODS.GET_ACTIONS, async (_event, keyword = ''): Promise<IpcResponse<SuperAction[]>> => {
    try {
        const actions = await actionManager.getActions(keyword);
        return { success: true, data: actions };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('获取插件动作失败', { error: errorMessage });
        return { success: false, error: errorMessage };
    }
})
    .validation({
        '0': {
            required: false,
            type: 'string',
            validator: (keyword) => typeof keyword === 'string' || keyword === undefined ? true : '关键词必须是字符串'
        }
    })
    .description('获取插件动作列表，支持关键词搜索');

// 执行插件动作
Route.handle(IPC_METHODS.EXECUTE_PLUGIN_ACTION, async (_event, actionId: string, keyword: string): Promise<IpcResponse<unknown>> => {
    return await pluginManager.executeAction(actionId, keyword);
})
    .validation({
        '0': { required: true, type: 'string' },
        '1': { required: true, type: 'string' }
    })
    .description('执行指定的插件动作');

// 获取动作视图
Route.handle(IPC_METHODS.GET_ACTION_VIEW, async (_event, actionId: string): Promise<string> => {
    return await actionManager.getActionView(actionId);
})
    .validation({
        '0': { required: true, type: 'string' }
    })
    .description('获取插件动作的视图内容'); 