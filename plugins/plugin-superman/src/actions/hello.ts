import { ActionResult, SuperContext } from '@coffic/buddy-it';

export const getHelloAction = (context: SuperContext) => {
  return {
    id: 'hello',
    description: '显示一个问候消息',
    run: async (context: SuperContext): Promise<ActionResult> => {
      return {
        success: true,
        message: `你好，当前软件版本是：${context.version.getCurrentVersion()}`,
      };
    },
  };
};
