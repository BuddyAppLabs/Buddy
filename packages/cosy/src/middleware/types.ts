/**
 * 中间件类型定义
 */

export interface IPCRequest {
    channel: string;
    args: any[];
}

export interface IPCResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: Record<string, any>;
}

export type NextFunction = () => Promise<IPCResponse>;

export abstract class Middleware {
    public abstract handle(
        request: IPCRequest,
        next: NextFunction
    ): Promise<IPCResponse>;
} 