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
} from '../../contracts/LogContract.js';
import { LogUtil } from '../../utils/LogUtil.js';
import { SuperLogger } from '@coffic/buddy-types';

export class ElectronLogChannel implements LogChannelContract {
    private logger: SuperLogger;
    private config: LogChannelConfig;
    private channelName: string;

    constructor(name: string, config: LogChannelConfig) {
        this.channelName = name;
        this.config = config;
        this.logger = LogUtil.createLogger();
    }

    /**
     * 格式化日志消息
     */
    private formatMessage(message: string, context?: LogContext): string {
        let formatted = `[${this.channelName}] ${message}`;

        if (context && Object.keys(context).length > 0) {
            if (this.config.format === 'json') {
                formatted += ` ${JSON.stringify(context)}`;
            } else if (this.config.format === 'structured') {
                const contextStr = Object.entries(context)
                    .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
                    .join(' ');
                formatted += ` {${contextStr}}`;
            } else {
                // simple format
                formatted += ` ${JSON.stringify(context)}`;
            }
        }

        return formatted;
    }

    /**
     * 检查是否应该记录该级别的日志
     */
    private shouldLog(level: LogLevel): boolean {
        if (!this.config.level) return true;

        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const configLevelIndex = levels.indexOf(this.config.level);
        const currentLevelIndex = levels.indexOf(level);

        return currentLevelIndex >= configLevelIndex;
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
        if (!this.shouldLog(level)) {
            return;
        }

        const formattedMessage = this.formatMessage(message, context);

        switch (level) {
            case LogLevel.DEBUG:
                this.logger.debug(formattedMessage);
                break;
            case LogLevel.INFO:
                this.logger.info(formattedMessage);
                break;
            case LogLevel.WARN:
                this.logger.warn(formattedMessage);
                break;
            case LogLevel.ERROR:
                this.logger.error(formattedMessage);
                break;
        }
    }
}

export class ElectronLogDriver implements LogDriverContract {
    createChannel(config: LogChannelConfig): LogChannelContract {
        return new ElectronLogChannel(config.name || 'default', config);
    }
}