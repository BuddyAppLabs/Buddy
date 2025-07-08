import path from 'path';
import { ActionResult, SuperContext } from '@coffic/buddy-it';

const log = {
  debug: function (message: string, ...args: any[]): void {
    console.log(`[示例插件:调试] ${message}`, ...args);
  },
};

export default {
  id: 'time',
  description: '显示当前时间',
  icon: '🕒',
  viewPath: path.join(__dirname, 'views/time.html'),
  viewMode: 'embedded' as const,
  devTools: false,
  async run(context: SuperContext): Promise<ActionResult> {
    log.debug(`执行时间动作（有自定义视图）`);
    return {
      success: true,
      message: '当前时间是：' + new Date().toLocaleString(),
    };
  },
};