import { tool } from 'ai';
import { z } from 'zod';
import { IChatLogger } from '../contract/IChatLogger';

export function createWeatherTool(logger: IChatLogger | null) {
  return tool({
    description: 'Get the weather in a location',
    parameters: z.object({
      location: z.string().describe('The location to get the weather for'),
    }),
    execute: async ({ location }) => {
      logger?.info(`Get the weather in ${location}`);
      return {
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      };
    },
  });
}
