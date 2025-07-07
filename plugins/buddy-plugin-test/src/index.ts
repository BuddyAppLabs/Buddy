import {
  ExecuteActionArgs,
  ExecuteResult,
  GetActionsArgs,
  SuperAction,
  SuperPlugin,
} from '@coffic/buddy-types';

// 日志函数
const log = {
  info: function (message: string, ...args: any[]): void {
    console.log(`[状态插件] ${message}`, ...args);
  },
  error: function (message: string, ...args: any[]): void {
    console.error(`[状态插件] ${message}`, ...args);
  },
  debug: function (message: string, ...args: any[]): void {
    console.log(`[状态插件:调试] ${message}`, ...args);
  },
};

// 插件ID
const PLUGIN_ID = 'sample-plugin-state';

// 插件对象
export const plugin: SuperPlugin = {
  id: PLUGIN_ID,
  name: '状态插件',
  description: '这是一个状态插件',
  version: '1.0.0',
  author: 'Coffic',
  path: '',
  type: 'user',
  devTools: true,

  async getActions(args: GetActionsArgs): Promise<SuperAction[]> {
    log.info(
      `获取动作列表，关键词: "${args.keyword}", 被覆盖应用: "${args.overlaidApp}"`
    );

    let actions: SuperAction[] = [
      {
        id: `version`,
        description: '当前版本：' + args.version,
        icon: '👋',
        globalId: '',
        pluginId: '',
      },
    ];

    if (args.overlaidApp) {
      actions.push({
        id: `hello`,
        description: '当前应用：' + args.overlaidApp,
        icon: '👋',
        globalId: '',
        pluginId: '',
      });
    }

    log.debug(`基础动作列表: ${actions.length} 个动作`);

    // 如果有关键词，过滤匹配的动作
    if (args.keyword) {
      const lowerKeyword = args.keyword.toLowerCase();
      log.debug(`过滤包含关键词 "${lowerKeyword}" 的动作`);

      const filteredActions = actions.filter((action) =>
        action.description.toLowerCase().includes(lowerKeyword)
      );

      log.info(`过滤后返回 ${filteredActions.length} 个动作`);
      return filteredActions;
    }

    log.info(`返回所有 ${actions.length} 个动作`);
    return actions;
  },

  async executeAction(args: ExecuteActionArgs): Promise<ExecuteResult> {
    if (args.actionId === 'version') {
      log.info(`执行动作: ${args.actionId}`);
      const result = await args.context?.version.checkForUpdates();
      return { success: true, message: `当前版本：${result}` };
    }

    return { success: true, message: '不支持执行动作' };
  },
};
