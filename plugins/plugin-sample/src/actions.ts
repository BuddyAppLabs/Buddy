import path from 'path';
import { ExecuteActionArgs, ExecuteResult } from '@coffic/buddy-types';

const log = {
  info: function (message: string, ...args: any[]): void {
    console.log(`[示例插件] ${message}`, ...args);
  },
  error: function (message: string, ...args: any[]): void {
    console.error(`[示例插件] ${message}`, ...args);
  },
  debug: function (message: string, ...args: any[]): void {
    console.log(`[示例插件:调试] ${message}`, ...args);
  },
};

export const actions = [
  {
    id: 'hello',
    description: '显示一个问候消息',
    icon: '👋',
    async run(args: ExecuteActionArgs): Promise<ExecuteResult> {
      log.debug(`执行打招呼动作`);
      return { success: true, message: '你好，这是来自示例插件的问候！' };
    },
  },
  {
    id: 'ai_generate_text',
    description: 'AI生成文本',
    icon: '🤖',
    async run(args: ExecuteActionArgs): Promise<ExecuteResult> {
      const result = await args.context?.ai.generateText('生成简短的问候语');
      return {
        success: true,
        message: result ? `成功` : '没有结果',
        alert: result,
      };
    },
  },
  {
    id: 'set_ai_provider_key_deepseek',
    description: '设置DeepSeek密钥',
    icon: '🤖',
    async run(args: ExecuteActionArgs): Promise<ExecuteResult> {
      log.debug(`执行设置DeepSeek密钥动作`);
      try {
        await args.context?.ai.setModelApiKey('deepseek', args.keyword ?? '');
        return { success: true, message: '密钥设置成功' };
      } catch (error) {
        log.error(`设置DeepSeek密钥失败:`, error);
        return {
          success: false,
          message: '设置密钥失败' + (error as Error).message,
        };
      }
    },
  },
  {
    id: 'time',
    description: '显示当前时间',
    icon: '🕒',
    viewPath: path.join(__dirname, 'views/time.html'),
    viewMode: 'embedded' as const,
    devTools: false,
    async run(args: ExecuteActionArgs): Promise<ExecuteResult> {
      log.debug(`执行时间动作（有自定义视图）`);
      return {
        success: true,
        message: '当前时间是：' + new Date().toLocaleString(),
      };
    },
  },
  {
    id: 'calculate',
    description: '简单的计算器',
    icon: '🧮',
    viewPath: path.join(__dirname, 'views/calculator.html'),
    viewMode: 'window' as const,
    devTools: false,
    async run(args: ExecuteActionArgs): Promise<ExecuteResult> {
      log.debug(`执行计算器动作（有自定义视图）`);
      return { success: true, message: '计算结果是：' + (1 + 1) };
    },
  },
  {
    id: 'open_config',
    description: '打开配置文件夹',
    icon: '📝',
    async run(args: ExecuteActionArgs): Promise<ExecuteResult> {
      if (args.context && args.context.fs) {
        args.context.config.openConfigFolder();
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
  },
  {
    id: 'open_logs',
    description: '打开日志文件夹',
    icon: '📝',
    async run(args: ExecuteActionArgs): Promise<ExecuteResult> {
      args.context?.config.openLogsFolder();
      return {
        success: true,
        message: `日志已打开`,
      };
    },
  },
];
