import z from 'zod';
import { createUserStatusTool } from './tools/userStatus';
import { createWeatherTool } from './tools/weather';
import { createTimeTool } from './tools/time';
import { IChatLogger } from './contract/IChatLogger';

export const getTools = (logger: IChatLogger | null, user?: any) => ({
  weatherTool: createWeatherTool(logger),
  timeTool: createTimeTool(logger),
  userStatusTool: createUserStatusTool(user),
  // client-side tool that is automatically executed on the client:
  getLocation: {
    description:
      'Get the user location. Always ask for confirmation before using this tool. 获取用户的位置，在使用此工具之前，必须向用户请求权限。',
    parameters: z.object({}),
  },
  // client-side tool that starts user interaction:
  askForConfirmation: {
    description: 'Ask the user for confirmation.',
    parameters: z.object({
      message: z.string().describe('The message to ask for confirmation.'),
    }),
  },
});
