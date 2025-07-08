import path from 'path';
import { ActionResult, SuperContext } from '@coffic/buddy-it';

export const getTimeAction = (context: SuperContext) => {
  if (context.keyword.startsWith('time')) {
    return {
      id: 'time',
      description: '显示当前时间',
      icon: '🕒',
      viewPath: path.join(__dirname, 'views/time.html'),
      viewMode: 'embedded' as const,
      devTools: false,
      async run(context: SuperContext): Promise<ActionResult> {
        return {
          success: true,
          message: '当前时间是：' + new Date().toLocaleString(),
        };
      },
    };
  }

  return null;
};
