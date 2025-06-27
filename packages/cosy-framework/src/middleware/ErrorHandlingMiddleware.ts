import { IpcMainInvokeEvent } from 'electron';
import { IMiddleware } from '../contract';

/**
 * 错误处理中间件
 * 捕获并处理中间件链中的错误
 */
export const ErrorHandlingMiddleware: IMiddleware = async (
  event: IpcMainInvokeEvent,
  next: () => Promise<any>
) => {
  try {
    return await next();
  } catch (error) {
    // 只输出错误message，不输出完整的错误对象（包括堆栈）
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('🚨 [ErrorHandlingMiddleware]', errorMessage);

    // 返回错误响应而不是重新抛出错误
    return {
      success: false,
      error: errorMessage,
    };
  }
};
