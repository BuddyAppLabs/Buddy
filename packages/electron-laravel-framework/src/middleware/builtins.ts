/**
 * 内置中间件
 */
import { Middleware, IPCRequest, IPCResponse, NextFunction } from './types.js';

/**
 * 日志中间件
 */
export class LoggingMiddleware extends Middleware {
    public async handle(
        request: IPCRequest,
        next: NextFunction
    ): Promise<IPCResponse> {
        const start = Date.now();
        console.log(`[IPC] ${request.channel} - Start`);

        const response = await next();

        const duration = Date.now() - start;
        console.log(`[IPC] ${request.channel} - ${response.success ? 'Success' : 'Error'} (${duration}ms)`);

        return response;
    }
}

/**
 * 错误处理中间件
 */
export class ErrorHandlingMiddleware extends Middleware {
    public async handle(
        request: IPCRequest,
        next: NextFunction
    ): Promise<IPCResponse> {
        try {
            return await next();
        } catch (error) {
            console.error(`[IPC Error] ${request.channel}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}

/**
 * 验证中间件基类
 */
export abstract class ValidationMiddleware extends Middleware {
    public async handle(
        request: IPCRequest,
        next: NextFunction
    ): Promise<IPCResponse> {
        const validation = this.validate(request);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error,
            };
        }

        return await next();
    }

    protected abstract validate(request: IPCRequest): { success: boolean; error?: string };
} 