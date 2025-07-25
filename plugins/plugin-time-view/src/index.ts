/**
 * 示例插件 - 带有页面视图
 * 演示如何创建一个带有主页面的插件
 */
import {
  SuperPlugin,
  SuperAction,
  SuperContext,
  ActionResult,
} from '@coffic/buddy-it';

// 插件ID
const PLUGIN_ID = 'sample-plugin-time';

// 插件对象
const plugin: SuperPlugin = {
  id: PLUGIN_ID,
  name: '示例页面插件',
  description: '这是一个带有主页面的示例插件',
  version: '1.0.0',
  author: 'Coffic',
  path: '',
  type: 'user',
  pagePath: 'dist/views/time.html',

  /**
   * 获取插件提供的动作列表
   * @param {ActionContext} context 上下文信息
   * @returns {Promise<Action[]>} 动作列表
   */
  async getActions(context: SuperContext): Promise<SuperAction[]> {
    return [];
  },

  async executeAction(context: SuperContext): Promise<ActionResult> {
    return { success: true, message: '不支持执行动作' };
  },
};

// 导出插件对象
export default plugin;
