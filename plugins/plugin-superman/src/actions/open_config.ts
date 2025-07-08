import { ActionResult, SuperContext } from '@coffic/buddy-it';

export default {
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