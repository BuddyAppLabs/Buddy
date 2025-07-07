import path from 'path';
import {
  GetActionsArgs,
  SuperAction,
  SuperPlugin,
  ExecuteResult,
  ExecuteActionArgs,
  SuperContext,
} from '@coffic/buddy-types';

// 日志函数
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

// 插件信息
const plugin: SuperPlugin = {
  name: '示例插件',
  description: '这是一个示例插件，演示如何创建GitOK插件',
  version: '1.0.0',
  author: 'Coffic',
  id: '',
  path: '',
  type: 'user',

  /**
   * 获取插件提供的动作列表
   * @param {SuperContext} context 插件上下文
   * @returns {Promise<Action[]>} 动作列表
   */
  async getActions(args: GetActionsArgs): Promise<SuperAction[]> {
    log.info(
      `获取动作列表，关键词: "${args.keyword}", 被覆盖应用: "${args.overlaidApp}"`
    );

    // 创建基础动作列表
    const actions: SuperAction[] = [
      {
        id: `hello`,
        description: '显示一个问候消息',
        icon: '👋',
        globalId: '',
        pluginId: '',
      },
      {
        id: `ai_generate_text`,
        description: 'AI生成文本',
        icon: '🤖',
        globalId: '',
        pluginId: '',
      },
      {
        id: `set_ai_provider_key_deepseek`,
        description: '设置DeepSeek密钥',
        icon: '🤖',
        globalId: '',
        pluginId: '',
      },
      {
        id: `time`,
        description: '显示当前时间',
        icon: '🕒',
        viewPath: path.join(__dirname, 'views/time.html'),
        viewMode: 'embedded',
        devTools: false,
        globalId: '',
        pluginId: '',
      },
      {
        id: `calculate`,
        description: '简单的计算器',
        icon: '🧮',
        viewPath: path.join(__dirname, 'views/calculator.html'),
        viewMode: 'window',
        devTools: false,
        globalId: '',
        pluginId: '',
      },
      {
        id: `open_config`,
        description: '打开配置文件夹',
        icon: '📝',
        globalId: '',
        pluginId: '',
      },
      {
        id: `open_logs`,
        description: '打开日志文件夹',
        icon: '📝',
        globalId: '',
        pluginId: '',
      },
    ];

    // 如果有关键词，过滤匹配的动作
    if (args.keyword) {
      const lowerKeyword = args.keyword.toLowerCase();

      const filteredActions = actions.filter(
        (action) =>
          action.description.toLowerCase().includes(lowerKeyword) ||
          action.id.toLowerCase().includes(lowerKeyword) ||
          action.id == 'set_ai_provider_key_deepseek'
      );

      return filteredActions;
    }

    log.info(`返回所有 ${actions.length} 个动作`);
    return actions;
  },

  /**
   * 执行插件动作
   * @param {ExecuteActionArgs} args 动作执行参数
   * @returns {Promise<ExecuteResult>} 动作执行结果
   */
  async executeAction(args: ExecuteActionArgs): Promise<ExecuteResult> {
    const { actionId, context } = args;

    // 使用插件上下文提供的日志功能
    if (context && context.logger) {
      context.logger.info(`执行动作: ${actionId}`);
    } else {
      log.info(`执行动作: ${actionId}`);
    }

    try {
      switch (actionId) {
        case `hello`:
          log.debug(`执行打招呼动作`);
          return { success: true, message: '你好，这是来自示例插件的问候！' };

        case `ai_generate_text`:
          const result = await context?.ai.generateText('生成简短的问候语');
          return {
            success: true,
            message: result ? `成功` : '没有结果',
            alert: result,
          };

        case `set_ai_provider_key_deepseek`:
          log.debug(`执行设置DeepSeek密钥动作`);
          try {
            await context?.ai.setModelApiKey('deepseek', args.keyword ?? '');
            return { success: true, message: '密钥设置成功' };
          } catch (error) {
            log.error(`设置DeepSeek密钥失败:`, error);
            return {
              success: false,
              message: '设置密钥失败' + (error as Error).message,
            };
          }

        case `time`:
          log.debug(`执行时间动作（有自定义视图）`);
          return {
            success: true,
            message: '当前时间是：' + new Date().toLocaleString(),
          };

        case `calculate`:
          log.debug(`执行计算器动作（有自定义视图）`);
          return { success: true, message: '计算结果是：' + (1 + 1) };

        case `open_config`:
          // 使用插件上下文提供的文件系统能力
          if (context && context.fs) {
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
        case `open_logs`:
          context?.config.openLogsFolder();
          return {
            success: true,
            message: `日志已打开`,
          };
        default:
          const errorMsg = `未知的动作ID: ${actionId}`;
          log.error(errorMsg);
          throw new Error(errorMsg);
      }
    } catch (error) {
      log.error(`执行动作 ${actionId} 失败:`, error);
      throw error;
    }
  },
};

// 导出插件
export = plugin;
