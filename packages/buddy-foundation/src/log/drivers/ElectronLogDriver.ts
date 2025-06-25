/**
 * Electron Log 驱动实现
 * 基于 electron-log 的具体日志驱动
 */
import {
    LogDriverContract,
    LogChannelContract,
    LogChannelConfig,
    LogLevel,
    LogContext
} from '../contracts/LogContract.js';

export class ElectronLogChannel implements LogChannelContract {
    private config: LogChannelConfig;
    private channelName: string;

    constructor(name: string, config: LogChannelConfig) {
        this.channelName = name;
        this.config = config;
    }

    debug(message: string, context?: LogContext): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    info(message: string, context?: LogContext): void {
        this.log(LogLevel.INFO, message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.log(LogLevel.WARN, message, context);
    }

    error(message: string, context?: LogContext): void {
        this.log(LogLevel.ERROR, message, context);
    }

    log(level: LogLevel, message: string, context?: LogContext): void {
        // 根据配置的格式化方式处理日志
        const formattedMessage = this.formatMessage(message, context);

        // 根据日志级别调用对应的方法
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(formattedMessage);
                break;
            case LogLevel.INFO:
                console.info(formattedMessage);
                break;
            case LogLevel.WARN:
                console.warn(formattedMessage);
                break;
            case LogLevel.ERROR:
                console.error(formattedMessage);
                break;
        }
    }

    private formatMessage(message: string, context?: LogContext): string {
        const format = this.config.format || 'simple';

        switch (format) {
            case 'json':
                return JSON.stringify({
                    channel: this.channelName,
                    message,
                    context,
                    timestamp: new Date().toISOString()
                });

            case 'structured':
                const contextStr = context ? ` ${JSON.stringify(context)}` : '';
                return `[${this.channelName}] [${new Date().toISOString()}] ${message}${contextStr}`;

            case 'simple':
            default:
                return context ? `${message} ${JSON.stringify(context)}` : message;
        }
    }
}

export class ElectronLogDriver implements LogDriverContract {
    createChannel(config: LogChannelConfig): LogChannelContract {
        return new ElectronLogChannel(config.name || 'default', config);
    }
} 