import { ActionResult, SuperContext } from '@coffic/buddy-it';

export const getOpenLogsAction = (context: SuperContext) => {
  if (
    context.keyword.startsWith('logs') ||
    context.keyword.startsWith('日志')
  ) {
    return {
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
  }
  return null;
};
