import {
  ActionResult,
  SuperContext,
  SuperAction,
  SuperPlugin,
} from '@coffic/buddy-it';

// 插件ID
const PLUGIN_ID = 'sample-plugin-with-page';

// 插件对象
export const plugin: SuperPlugin = {
  id: PLUGIN_ID,
  name: '示例页面插件',
  description: '这是一个带有主页面的示例插件',
  version: '1.0.0',
  author: 'Coffic',
  path: '',
  type: 'user',
  pagePath: 'dist/views/counter.html',
  devTools: true,

  async getActions(context: SuperContext): Promise<SuperAction[]> {
    return [];
  },

  async executeAction(context: SuperContext): Promise<ActionResult> {
    return { success: true, message: '不支持执行动作' };
  },
};
