import { LogLevel } from './LogLevel.js';
import { LogContext } from './LogContext.js';

/**
 * 日志通道契约
 */
export interface LogChannelContract {
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
    log(level: LogLevel, message: string, context?: LogContext): void;
} 