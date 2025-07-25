import { tool } from 'ai';
import { z } from 'zod';
import { IChatLogger } from '../contract/IChatLogger';

/**
 * 获取当前时间的工具。
 */
export function createTimeTool(logger: IChatLogger | null) {
  return tool({
    description: 'Get the current time',
    parameters: z.object({}),
    execute: async () => {
      logger?.info('Get the current time');
      return {
        time: new Date().toLocaleString(),
      };
    },
  });
}
