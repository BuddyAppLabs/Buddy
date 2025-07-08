import { ActionResult, SuperContext } from '@coffic/buddy-it';

const log = {
  debug: function (message: string, ...args: any[]): void {
    console.log(`[示例插件:调试] ${message}`, ...args);
  },
  error: function (message: string, ...args: any[]): void {
    console.error(`[示例插件] ${message}`, ...args);
  },
};

export default {
  id: 'set_ai_provider_key_deepseek',
  description: '设置DeepSeek密钥',
  icon: '🤖',
  async run(context: SuperContext): Promise<ActionResult> {
    log.debug(`执行设置DeepSeek密钥动作`);
    try {
      await context.ai.setModelApiKey('deepseek', context.keyword ?? '');
      return { success: true, message: '密钥设置成功' };
    } catch (error) {
      log.error(`设置DeepSeek密钥失败:`, error);
      return {
        success: false,
        message: '设置密钥失败' + (error as Error).message,
      };
    }
  },
};