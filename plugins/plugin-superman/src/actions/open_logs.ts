import { ActionResult, SuperContext } from '@coffic/buddy-it';

export default {
  id: 'open_logs',
  description: '打开日志文件夹',
  icon: '📝',
  async run(context: SuperContext): Promise<ActionResult> {
    context.config.openLogsFolder();
    return {
      success: true,
      message: `日志已打开`,
    };
  },
};