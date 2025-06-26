/**
 * 日志中间件
 * 记录IPC请求的日志信息
 */

import { IpcMainInvokeEvent } from 'electron';
import { Middleware } from '../types';

/**
 * 日志中间件工厂函数
 */
export function LoggingMiddleware(options: {
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    includeArgs?: boolean;
    includeResponse?: boolean;
} = {}): Middleware {
    const { logLevel = 'info', includeArgs = false, includeResponse = false } = options;

    return async (event: IpcMainInvokeEvent, next: () => Promise<any>, ...args: any[]) => {
        const startTime = Date.now();
        const webContentsId = event.sender.id;

        // 记录请求开始
        const logMessage = includeArgs
            ? `IPC请求开始 [WebContents:${webContentsId}] 参数: ${JSON.stringify(args)}`
            : `IPC请求开始 [WebContents:${webContentsId}]`;

        console[logLevel](`[${new Date().toISOString()}] ${logMessage}`);

        try {
            const result = await next();
            const duration = Date.now() - startTime;

            // 记录请求成功
            const successMessage = includeResponse
                ? `IPC请求成功 [WebContents:${webContentsId}] 耗时: ${duration}ms 响应: ${JSON.stringify(result)}`
                : `IPC请求成功 [WebContents:${webContentsId}] 耗时: ${duration}ms`;

            console[logLevel](`[${new Date().toISOString()}] ${successMessage}`);

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;

            // 记录请求错误
            console.error(`[${new Date().toISOString()}] IPC请求失败 [WebContents:${webContentsId}] 耗时: ${duration}ms 错误:`, error);

            throw error;
        }
    };
} 