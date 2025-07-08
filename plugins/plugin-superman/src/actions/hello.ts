import { ActionResult, SuperContext } from '@coffic/buddy-it';

const log = {
  debug: function (message: string, ...args: any[]): void {
    console.log(`[示例插件:调试] ${message}`, ...args);
  },
};

export default {
  id: 'hello',
  description: '显示一个问候消息',
  icon: '👋',
  async run(context: SuperContext): Promise<ActionResult> {
    log.debug(`执行打招呼动作`);
    return { success: true, message: '你好，这是来自示例插件的问候！' };
  },
};