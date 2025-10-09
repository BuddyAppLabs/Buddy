/**
 * 插件动作相关路由
 * 处理插件动作的查询和执行
 */

import { IPC_METHODS } from '@/types/ipc-methods.js';
import { RouteFacade } from '@coffic/cosy-framework';
import { PluginFacade } from '../providers/plugin/PluginFacade.js';
import { SendableAction } from '@/types/sendable-action.js';
import { appStateManager } from '../providers/state/StateManager.js';
import { ContextManager } from '../providers/plugin/manager/ContextManager.js';
import { ActionResult } from '@coffic/buddy-it';
import { AIFacade } from '../providers/ai/AIFacade.js';

export function registerActionsRoutes(): void {
  // 获取插件动作列表
  RouteFacade.handle(
    IPC_METHODS.GET_ACTIONS,
    async (_event, keyword: string = ''): Promise<SendableAction[]> => {
      const overlaidApp = appStateManager.getOverlaidApp()?.name ?? '';
      const actions = await PluginFacade.getActions(
        ContextManager.createContext(
          undefined,
          undefined,
          '',
          keyword,
          overlaidApp
        )
      );
      return actions.map((action) => action.toSendableAction());
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
    async (
      _event,
      actionId: string,
      keyword: string
    ): Promise<ActionResult> => {
      const overlaidApp = appStateManager.getOverlaidApp()?.name ?? '';
      const aiManager = AIFacade;
      const plugin = await PluginFacade.find(actionId);
      return await PluginFacade.executeAction(
        ContextManager.createContext(
          plugin,
          aiManager,
          actionId,
          keyword,
          overlaidApp
        )
      );
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
      '1': { required: true, type: 'string' },
    })
    .description('执行指定的插件动作');

  // 获取动作视图的HTML内容
  RouteFacade.handle(
    IPC_METHODS.GET_ACTION_VIEW_HTML,
    async (_event, actionId: string): Promise<string> => {
      return await PluginFacade.getActionView(actionId);
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
    })
    .description('获取插件动作的视图内容');
}
