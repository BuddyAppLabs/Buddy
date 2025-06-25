/**
 * Log Facade - 日志门面
 * 提供Laravel风格的统一日志访问接口
 * 通过服务容器解析实际的LogManager实例
 */
import { Application } from '@coffic/cosy';
import {
    LogManagerContract,
    LogChannelContract,
    LogContext,
    ContextualLoggerContract,
    LogChannelConfig
} from '../contracts/LogContract.js';

export class Log {
    private static app: Application;

    /**
     * 设置应用实例
     */
    public static setApp(app: Application): void {
        this.app = app;
    }

    /**
     * 获取LogManager实例
     */
    private static getManager(): LogManagerContract {
        if (!this.app) {
            throw new Error('Log facade: App instance not set. Please call Log.setApp() first.');
        }
        return this.app.make('log.manager');
    }

    /**
     * 获取指定通道
     */
    public static channel(name?: string): LogChannelContract {
        return this.getManager().channel(name);
    }

    /**
     * 创建带上下文的日志记录器
     */
    public static withContext(context: LogContext): ContextualLoggerContract {
        return this.getManager().withContext(context);
    }

    /**
     * 扩展日志驱动
     */
    public static extend(driver: string, callback: (config: LogChannelConfig) => LogChannelContract): void {
        this.getManager().extend(driver, callback);
    }

    /**
     * 记录调试日志
     */
    public static debug(message: string, context?: LogContext): void {
        this.getManager().debug(message, context);
    }

    /**
     * 记录信息日志
     */
    public static info(message: string, context?: LogContext): void {
        this.getManager().info(message, context);
    }

    /**
     * 记录警告日志
     */
    public static warn(message: string, context?: LogContext): void {
        this.getManager().warn(message, context);
    }

    /**
     * 记录错误日志
     */
    public static error(message: string, context?: LogContext): void {
        this.getManager().error(message, context);
    }

    /**
     * 获取可用的通道列表
     */
    public static getAvailableChannels(): string[] {
        return this.getManager().getAvailableChannels();
    }

    /**
     * 动态创建新通道
     */
    public static createChannel(name: string, config: LogChannelConfig): LogChannelContract {
        return this.getManager().createChannel(name, config);
    }
} 