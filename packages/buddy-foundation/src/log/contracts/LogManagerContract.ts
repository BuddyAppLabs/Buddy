import { LogChannelContract } from './LogChannelContract.js';
import { ChannelFactory } from './ChannelFactory.js';
import { LogChannelConfig } from './LogChannelConfig.js';
import { LogContext } from './LogContext.js';
import { ContextualLoggerContract } from './ContextualLoggerContract.js';

/**
 * 日志管理器契约
 */
export interface LogManagerContract {
    channel(name?: string): LogChannelContract;
    getDefaultDriver(): string;
    setDefaultDriver(name: string): void;
    extend(driver: string, callback: ChannelFactory): void;
    getAvailableChannels(): string[];
    createChannel(name: string, config: LogChannelConfig): LogChannelContract;
    withContext(context: LogContext): ContextualLoggerContract;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
} 