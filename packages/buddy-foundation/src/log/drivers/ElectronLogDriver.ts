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
} from '../contracts/index.js';
import chalk from 'chalk';

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
        // 根据日志级别选择颜色
        let colorizer = (str: string) => str;
        switch (level) {
            case LogLevel.DEBUG:
                colorizer = chalk.gray;
                break;
            case LogLevel.INFO:
                colorizer = chalk.green;
                break;
            case LogLevel.WARN:
                colorizer = chalk.yellow;
                break;
            case LogLevel.ERROR:
                colorizer = chalk.red;
                break;
        }

        // 根据配置的格式化方式处理日志，并应用颜色
        const formattedMessage = this.formatMessage(message, context, colorizer);

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

    private formatMessage(
        message: string,
        context: LogContext | undefined,
        colorize: (str: string) => string
    ): string {
        const format = this.config.format || 'simple';
        const contextStr = context ? ` ${chalk.dim(JSON.stringify(context))}` : '';

        switch (format) {
            case 'json':
                return JSON.stringify({
                    channel: this.channelName,
                    message,
                    context,
                    timestamp: new Date().toISOString()
                });

            case 'structured':
                const timestamp = this.config.includeTimestamp === false ? '' : ` [${new Date().toISOString()}]`;
                const mainMessage = `[${this.channelName}]${timestamp} ${message}`;
                return colorize(mainMessage) + contextStr;

            case 'simple':
            default:
                return colorize(message) + contextStr;
        }
    }
}

export class ElectronLogDriver implements LogDriverContract {
    createChannel(config: LogChannelConfig): LogChannelContract {
        return new ElectronLogChannel(config.name || 'default', config);
    }
} 