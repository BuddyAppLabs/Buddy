import {
  ActionResult,
  SuperAction,
  SuperContext,
  SuperPlugin,
} from '@coffic/buddy-it';
import { getActions } from './actions/index.js';

// 日志函数
const log = {
  info: function (message: string, ...args: any[]): void {
    console.log(`[示例插件] ${message}`, ...args);
  },
  error: function (message: string, ...args: any[]): void {
    console.error(`[示例插件] ${message}`, ...args);
  },
  debug: function (message: string, ...args: any[]): void {
    console.log(`[示例插件:调试] ${message}`, ...args);
  },
};

// 插件信息
const plugin: SuperPlugin = {
  name: '示例插件',
  description: '这是一个示例插件，演示如何创建GitOK插件',
  version: '1.0.0',
  author: 'Coffic',
  id: '',
  path: '',
  type: 'user',

  /**
   * 获取插件提供的动作列表
   */
  async getActions(context: SuperContext): Promise<SuperAction[]> {
    log.info(
      `获取动作列表，关键词: "${context.keyword}", 被覆盖应用: "${context.overlaidApp}"`
    );

    // 只返回元数据部分
    let actions = getActions(context);
    if (context.keyword) {
      const lowerKeyword = context.keyword.toLowerCase();
      actions = actions.filter(
        (action) =>
          action.description.toLowerCase().includes(lowerKeyword) ||
          action.id.toLowerCase().includes(lowerKeyword) ||
          action.id == 'set_ai_provider_key_deepseek'
      );
    }

    // 去除 run 字段，只返回元数据
    return actions.map(({ run, ...meta }) => ({
      ...meta,
    }));
  },

  /**
   * 执行插件动作
   */
  async executeAction(context: SuperContext): Promise<ActionResult> {
    const { actionId } = context;
    if (context.logger) {
      context.logger.info(`执行动作: ${actionId}`);
    } else {
      log.info(`执行动作: ${actionId}`);
    }
    const action = getActions(context).find((a) => a.id === actionId);
    if (!action) {
      const errorMsg = `未知的动作ID: ${actionId}`;
      log.error(errorMsg);
      throw new Error(errorMsg);
    }
    try {
      return await action.run(context);
    } catch (error) {
      log.error(`执行动作 ${actionId} 失败:`, error);
      throw error;
    }
  },
};

// 导出插件
export = plugin;
