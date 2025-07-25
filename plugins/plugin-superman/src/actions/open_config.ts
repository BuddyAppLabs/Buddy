import { ActionResult, SuperContext } from '@coffic/buddy-it';

export const getOpenConfigAction = (context: SuperContext) => {
  if (
    context.keyword.startsWith('config') ||
    context.keyword.startsWith('配置')
  ) {
    return {
      id: 'open_config',
      description: '打开配置文件夹',
      icon: '📝',
      async run(context: SuperContext): Promise<ActionResult> {
        if (context.fs) {
          context.config.openConfigFolder();
          return {
            success: true,
            message: `配置已打开`,
          };
        }
        return {
          success: false,
          message: '无法访问文件系统API',
        };
      },
    };
  }
  return null;
};
