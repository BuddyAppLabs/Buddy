import { IpcMainInvokeEvent } from 'electron';
import { IMiddleware } from '@coffic/cosy-framework';
import stringify from 'safe-stable-stringify';
import { LogFacade } from './LogFacade.js';

/**
 * 通用的日志中间件工厂。
 * 它可以记录通用请求和 Electron IPC 事件。
 *
 * @param options - 日志记录器的配置选项。
 * @returns 一个中间件函数。
 */
export function LoggingMiddleware(
  options: {
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    includeRequest?: boolean;
    includeResponse?: boolean;
    logFullError?: boolean;
  } = {}
): IMiddleware {
  const {
    logLevel = 'info',
    includeRequest = true,
    includeResponse = true,
    logFullError = true,
  } = options;

  return async (
    event: IpcMainInvokeEvent,
    next: () => Promise<any>,
    channel: string,
    ...args: any[]
  ) => {
    const startTime = Date.now();
    const requestContext = {
      source: 'ipc',
      channel: channel,
      webContentsId: event.sender.id,
      request: includeRequest ? args : undefined,
    };

    LogFacade.channel('logMiddleware')[logLevel](
      `🦌🦌🦌 🚀 请求开始`,
      requestContext
    );

    try {
      const result = await next();
      const duration = Date.now() - startTime;

      const successContext = {
        ...requestContext,
        duration: `${duration}ms`,
        response: includeResponse ? result : undefined,
      };

      LogFacade.channel('logMiddleware')[logLevel](
        `🦌🦌🦌 🎉 请求成功`,
        successContext
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorToLog = logFullError
        ? error
        : error instanceof Error
          ? error.message
          : String(error);

      const errorContext = {
        ...requestContext,
        duration: `${duration}ms`,
        error: errorToLog,
      };

      LogFacade.channel('logMiddleware').error(
        `🦌🦌🦌 ❌ 请求失败`,
        errorContext
      );

      throw error;
    }
  };
}
