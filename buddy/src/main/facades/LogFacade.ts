/**
 * Log Facade - 日志门面
 * 提供Laravel风格的统一日志访问接口
 * 通过服务容器解析实际的LogManager实例
 */
import { LogManagerContract, LogChannelContract, LogContext, ContextualLoggerContract } from '../contracts/LogContract.js';

export class LogFacade {
    private static app: any;

    /**
     * 设置应用实例
     */
    public static setApp(app: any): void {
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
     * 带上下文的日志记录
     */
    public static withContext(context: LogContext): ContextualLoggerContract {
        return this.getManager().withContext(context);
    }

    /**
     * 扩展日志驱动
     */
    public static extend(driver: string, callback: any): void {
        return this.getManager().extend(driver, callback);
    }

    /**
     * 获取可用通道列表
     */
    public static getAvailableChannels(): string[] {
        return this.getManager().getAvailableChannels();
    }

    /**
     * 获取默认驱动
     */
    public static getDefaultDriver(): string {
        return this.getManager().getDefaultDriver();
    }

    /**
     * 设置默认驱动
     */
    public static setDefaultDriver(name: string): void {
        return this.getManager().setDefaultDriver(name);
    }

    /**
     * 动态创建通道
     */
    public static createChannel(name: string, config: any): LogChannelContract {
        return this.getManager().createChannel(name, config);
    }

    // 便捷的日志方法 - 直接使用默认通道
    public static debug(message: string, context?: LogContext): void {
        this.getManager().debug(message, context);
    }

    public static info(message: string, context?: LogContext): void {
        this.getManager().info(message, context);
    }

    public static warn(message: string, context?: LogContext): void {
        this.getManager().warn(message, context);
    }

    public static error(message: string, context?: LogContext): void {
        this.getManager().error(message, context);
    }

    // Laravel风格的静态方法
    public static emergency(message: string, context?: LogContext): void {
        this.error(message, context); // emergency映射到error
    }

    public static alert(message: string, context?: LogContext): void {
        this.error(message, context); // alert映射到error
    }

    public static critical(message: string, context?: LogContext): void {
        this.error(message, context); // critical映射到error
    }

    public static notice(message: string, context?: LogContext): void {
        this.info(message, context); // notice映射到info
    }
}

// 导出便捷的logger实例 - 向后兼容
export const logger = {
    debug: (message: string, context?: LogContext) => LogFacade.debug(message, context),
    info: (message: string, context?: LogContext) => LogFacade.info(message, context),
    warn: (message: string, context?: LogContext) => LogFacade.warn(message, context),
    error: (message: string, context?: LogContext) => LogFacade.error(message, context),

    // Laravel风格的通道访问
    channel: (name?: string) => LogFacade.channel(name),
    withContext: (context: LogContext) => LogFacade.withContext(context)
}; 