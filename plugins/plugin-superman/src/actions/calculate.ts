import path from 'path';
import { ActionResult, SuperContext } from '@coffic/buddy-it';

const log = {
  debug: function (message: string, ...args: any[]): void {
    console.log(`[示例插件:调试] ${message}`, ...args);
  },
};

export const getCalculateAction = (context: SuperContext) => {
  if (
    context.keyword.startsWith('calc') ||
    context.keyword.startsWith('计算') ||
    context.keyword.startsWith('计算器')
  ) {
    return {
      id: 'calculate',
      description: '简单的计算器',
      icon: '🧮',
      viewPath: path.join(__dirname, 'views/calculator.html'),
      viewMode: 'window' as const,
      devTools: false,
      async run(context: SuperContext): Promise<ActionResult> {
        log.debug(`执行计算器动作（有自定义视图）`);
        return { success: true, message: '计算结果是：' + (1 + 1) };
      },
    };
  }

  return null;
};
