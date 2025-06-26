/**
 * Stack 驱动实现
 * 支持将多个日志通道组合在一起
 */
import {
    LogDriverContract,
    LogChannelContract,
    LogChannelConfig,
    LogLevel,
    LogContext
} from '../contracts/index.js';

export class StackChannel implements LogChannelContract {
    private channels: LogChannelContract[] = [];
    private channelName: string;

    constructor(name: string, channels: LogChannelContract[]) {
        this.channelName = name;
        this.channels = channels;
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
        // 将日志同时发送到所有通道
        this.channels.forEach(channel => {
            try {
                channel.log(level, message, context);
            } catch (error) {
                // 如果某个通道出错，不影响其他通道
                console.error(`Stack channel error in ${this.channelName}:`, error);
            }
        });
    }
}

export class StackDriver implements LogDriverContract {
    constructor(private channelResolver: (name: string) => LogChannelContract | null) { }

    createChannel(config: LogChannelConfig): LogChannelContract {
        const channels: LogChannelContract[] = [];

        if (config.channels) {
            for (const channelName of config.channels) {
                const channel = this.channelResolver(channelName);
                if (channel) {
                    channels.push(channel);
                } else {
                    console.warn(`Stack driver: channel '${channelName}' not found`);
                }
            }
        }

        return new StackChannel(config.name || 'stack', channels);
    }
} 