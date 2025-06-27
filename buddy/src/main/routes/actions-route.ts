/**
 * 插件动作相关路由
 * 处理插件动作的查询和执行
 */

import { SuperAction } from '@coffic/buddy-types';
import { actionManager } from '../providers/plugin/ActionManager.js';
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { RouteFacade } from '@coffic/cosy-framework';
import { LogFacade } from '@coffic/cosy-logger';
import { pluginManager } from '../providers/plugin/PluginManager.js';

export function registerActionsRoutes(): void {
  // 获取插件动作列表
  RouteFacade.handle(
    IPC_METHODS.GET_ACTIONS,
    async (_event, keyword = ''): Promise<SuperAction[]> => {
      const actions = await actionManager.getActions(keyword);
      LogFacade.channel('route').error('get actions');
      return actions;
    }
  )
    .validation({
      '0': {
        required: false,
        type: 'string',
        validator: (keyword) =>
          typeof keyword === 'string' || keyword === undefined
            ? true
            : '关键词必须是字符串',
      },
    })
    .description('获取插件动作列表，支持关键词搜索');

  // 执行插件动作
  RouteFacade.handle(
    IPC_METHODS.EXECUTE_PLUGIN_ACTION,
    async (_event, actionId: string, keyword: string): Promise<unknown> => {
      const response = await pluginManager.executeAction(actionId, keyword);
      return response;
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
      '1': { required: true, type: 'string' },
    })
    .description('执行指定的插件动作');

  // 获取动作视图
  RouteFacade.handle(
    IPC_METHODS.GET_ACTION_VIEW,
    async (_event, actionId: string): Promise<string> => {
      return await actionManager.getActionView(actionId);
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
    })
    .description('获取插件动作的视图内容');
}
