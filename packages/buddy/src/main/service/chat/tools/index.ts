import z from 'zod';
import { timeTool } from './time';
import { weatherTool } from './weather';
import { createUserStatusTool } from './userStatus';
import { generateOutlineTool } from './story-generate/generate-outline';
import { createText2ImageTool } from './text2image/tool-create';
import { createText2ImageStatusTool } from './text2image/tool-status';
import { text2ImageModelsTool } from './text2image/tool-get-models';
import { askForStoryInfoTool } from './story-generate/ask-for-story-info';
import { askForImageInfoTool } from './text2image/tool-ask-for-info';
import { askForImageModelTool } from './text2image/tool-ask-for-model';

/**
 * 获取所有工具
 *
 * @param user - 用户对象（可选）
 * @param dashScopeApiKey - DashScope API 密钥（可选，用于图片处理工具）
 * @returns 工具对象
 */
export async function getTools(user?: any, dashScopeApiKey?: string) {
  // 基础工具
  const baseTools = {
    weatherTool,
    timeTool,
    userStatusTool: createUserStatusTool(user),

    // client-side tool that is automatically executed on the client:
    getLocation: {
      description:
        'Get the user location. Always ask for confirmation before using this tool. 获取用户的位置，在使用此工具之前，必须向用户请求权限。',
      inputSchema: z.object({}),
    },
    // client-side tool that starts user interaction:
    askForConfirmation: {
      description: 'Ask the user for confirmation.',
      inputSchema: z.object({
        message: z.string().describe('The message to ask for confirmation.'),
      }),
      // When cancelled, AI model should handle accordingly
    },

    // 生成故事
    askForStoryInfo: askForStoryInfoTool,
    generateOutline: generateOutlineTool,

    // 图片生成
    askForImageInfo: askForImageInfoTool,
    askForImageModel: askForImageModelTool,
    text2imageCreate: createText2ImageTool(dashScopeApiKey),
    text2imageGetStatus: createText2ImageStatusTool(dashScopeApiKey),
    text2imageListModels: text2ImageModelsTool(),
  };

  return {
    tools: baseTools,
  };
}
