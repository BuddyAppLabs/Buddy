/**
 * 内置中间件
 */
import { Middleware } from '../types.js';

/**
 * 错误处理中间件
 */
export const ErrorHandlingMiddleware: Middleware = async (request, next) => {
    try {
        return await next();
    } catch (error) {
        console.error('🚨 [ErrorHandlingMiddleware]', error);
        throw error;
    }
};

/**
 * 日志中间件
 */
export const LoggingMiddleware: Middleware = async (request, next) => {
    const start = Date.now();
    console.log('📝 [LoggingMiddleware] Request:', request);
    
    try {
        const result = await next();
        const duration = Date.now() - start;
        console.log(`✅ [LoggingMiddleware] Response (${duration}ms):`, result);
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        console.error(`❌ [LoggingMiddleware] Error (${duration}ms):`, error);
        throw error;
    }
};