/**
 * 日志系统契约接口
 * 定义日志服务的抽象，支持依赖注入和接口替换
 */

// 日志级别枚举
export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

// 日志上下文
export interface LogContext {
    [key: string]: any;
}

// 上下文日志记录器契约
export interface ContextualLoggerContract {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

// 日志通道契约
export interface LogChannelContract {
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
    log(level: LogLevel, message: string, context?: LogContext): void;
}

// 日志管理器契约
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

// 日志驱动工厂契约
export interface LogDriverContract {
    createChannel(config: LogChannelConfig): LogChannelContract;
}

// 日志通道配置接口
export interface LogChannelConfig {
    driver: string;
    name?: string;
    level?: LogLevel;
    path?: string;
    channels?: string[];
    format?: 'simple' | 'json' | 'structured';
    [key: string]: any; // 允许扩展配置
}

// 日志配置接口
export interface LogConfig {
    default: string;
    channels: {
        [key: string]: LogChannelConfig;
    };
}

// 通道工厂类型
export type ChannelFactory = (config: LogChannelConfig) => LogChannelContract; 