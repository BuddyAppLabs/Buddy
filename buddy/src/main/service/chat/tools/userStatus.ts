import { tool } from 'ai';
import z from 'zod';

export const createUserStatusTool = (user?: any) =>
  tool({
    description:
      '获取当前用户的登录状态和基本信息。可以用来检查用户是否已登录，以及获取用户的邮箱等信息。当用户询问登录状态、个人信息或需要根据登录状态提供不同建议时使用此工具。',
    parameters: z.object({}),
    execute: async () => {
      if (!user) {
        return {
          isLoggedIn: false,
          message: '用户未登录',
          suggestions: ['登录后可以访问更多功能'],
        };
      }

      return {
        isLoggedIn: true,
        user: {
          email: user.email,
          // 不返回敏感信息
        },
        message: `用户已登录，邮箱：${user.email}`,
        suggestions: [
          '您可以保存重要的对话内容',
          '可以访问个人资料页面管理账户',
          '享受完整的个性化服务',
        ],
      };
    },
  });

// 默认导出（向后兼容）
export const userStatusTool = createUserStatusTool();
