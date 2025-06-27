import { IpcMainInvokeEvent } from 'electron';
import { IMiddleware } from '@coffic/cosy-framework';
import { LogFacade } from './LogFacade.js';

/**
 * Checks if the given object is an Electron IpcMainInvokeEvent.
 * This is a type guard.
 * @param obj The object to check.
 * @returns True if the object is an IpcMainInvokeEvent, false otherwise.
 */
function isIpcMainInvokeEvent(obj: any): obj is IpcMainInvokeEvent {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.sender &&
    typeof obj.sender.id !== 'undefined'
  );
}

/**
 * A universal logging middleware factory.
 * It can log both generic requests and Electron IPC events.
 *
 * @param options - Configuration options for the logger.
 * @returns A middleware function.
 */
export function LoggingMiddleware(
  options: {
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    /** Whether to include the request data (IPC arguments or request object) in the log. */
    includeRequest?: boolean;
    /** Whether to include the response data in the log. */
    includeResponse?: boolean;
    /** Whether to log the full error object (including stack trace) or just the message. */
    logFullError?: boolean;
  } = {}
): IMiddleware {
  const {
    logLevel = 'info',
    includeRequest = false,
    includeResponse = false,
    logFullError = true,
  } = options;

  return async (
    arg1: IpcMainInvokeEvent | any,
    next: () => Promise<any>,
    ...args: any[]
  ) => {
    const startTime = Date.now();
    let context = '[Request]';
    let requestForLog: any = arg1;

    if (isIpcMainInvokeEvent(arg1)) {
      context = `[IPC][WebContents:${arg1.sender.id}]`;
      requestForLog = args;
    }

    const startMessage = `请求开始${
      includeRequest ? `，数据: ${JSON.stringify(requestForLog)}` : ''
    }`;
    LogFacade[logLevel](
      `[${new Date().toISOString()}] ${context} ${startMessage}`
    );

    try {
      const result = await next();
      const duration = Date.now() - startTime;

      const successMessage = `请求成功，耗时: ${duration}ms${
        includeResponse ? `，响应: ${JSON.stringify(result)}` : ''
      }`;
      LogFacade[logLevel](
        `[${new Date().toISOString()}] ${context} ${successMessage}`
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorToLog = logFullError
        ? error
        : error instanceof Error
          ? error.message
          : String(error);

      LogFacade.error(
        `[${new Date().toISOString()}] ${context} 请求失败，耗时: ${duration}ms，错误:`,
        { error: errorToLog }
      );

      throw error;
    }
  };
}
