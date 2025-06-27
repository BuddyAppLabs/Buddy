import { IpcMainInvokeEvent } from 'electron';
import { IMiddleware } from '@coffic/cosy-framework';

interface AuthContext {
  webContentsId: number;
  authenticated: boolean;
  permissions: string[];
  metadata?: Record<string, any>;
}

/**
 * 认证中间件工厂函数
 */
export function AuthMiddleware(
  options: {
    required?: boolean;
    permissions?: string[];
    authenticator?: (
      event: IpcMainInvokeEvent
    ) => Promise<AuthContext> | AuthContext;
  } = {}
): IMiddleware {
  const {
    required = true,
    permissions = [],
    authenticator = defaultAuthenticator,
  } = options;

  return async (
    event: IpcMainInvokeEvent,
    next: () => Promise<any>,
    ...args: any[]
  ) => {
    try {
      const authContext = await authenticator(event);

      // 检查是否需要认证
      if (required && !authContext.authenticated) {
        throw new Error('需要身份验证');
      }

      // 检查权限
      if (permissions.length > 0) {
        const hasPermissions = permissions.every((permission) =>
          authContext.permissions.includes(permission)
        );

        if (!hasPermissions) {
          throw new Error(`权限不足，需要权限: ${permissions.join(', ')}`);
        }
      }

      // 将认证上下文添加到事件中，供后续使用
      (event as any).authContext = authContext;

      return await next();
    } catch (error) {
      console.error('认证失败:', error);
      throw error;
    }
  };
}

/**
 * 默认认证器
 * 简单的基于WebContents ID的认证
 */
async function defaultAuthenticator(
  event: IpcMainInvokeEvent
): Promise<AuthContext> {
  const webContentsId = event.sender.id;

  // 简单的认证逻辑：假设所有WebContents都是已认证的
  // 在实际应用中，这里应该实现真正的认证逻辑
  return {
    webContentsId,
    authenticated: true,
    permissions: ['read', 'write'], // 默认权限
    metadata: {
      timestamp: Date.now(),
    },
  };
}

/**
 * 权限检查辅助函数
 */
export function requirePermissions(...permissions: string[]): IMiddleware {
  return AuthMiddleware({ permissions });
}

/**
 * 可选认证中间件
 */
export function optionalAuth(): IMiddleware {
  return AuthMiddleware({ required: false });
}
