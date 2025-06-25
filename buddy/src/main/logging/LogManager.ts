/**
 * 日志管理器 - 基于服务容器的实现
 * 参考Laravel的设计，支持依赖注入、驱动扩展和灵活配置
 */
import {
    LogManagerContract,
    LogChannelContract,
    LogDriverContract,
    LogChannelConfig,
    LogConfig,
    LogContext,
    ChannelFactory,
    ContextualLoggerContract
} from '../contracts/LogContract.js';
import { ElectronLogDriver } from './drivers/ElectronLogDriver.js';
import { StackDriver } from './drivers/StackDriver.js';

export class LogManager implements LogManagerContract {
    private config: LogConfig;
    private drivers: Map<string, LogDriverContract> = new Map();
    private channels: Map<string, LogChannelContract> = new Map();
    private customCreators: Map<string, ChannelFactory> = new Map();

    constructor(config: LogConfig) {
        this.config = config;
        this.registerDefaultDrivers();
    }

    /**
     * 注册默认驱动
     */
    private registerDefaultDrivers(): void {
        // 注册electron-log驱动
        this.drivers.set('electron', new ElectronLogDriver());

        // 注册stack驱动 - 需要传入channel解析器
        this.drivers.set('stack', new StackDriver((name: string) => this.getChannelInstance(name)));
    }

    /**
     * 获取或创建通道实例
     */
    private getChannelInstance(name: string): LogChannelContract | null {
        // 如果已经创建过，直接返回
        if (this.channels.has(name)) {
            return this.channels.get(name)!;
        }

        // 获取通道配置
        const channelConfig = this.config.channels[name];
        if (!channelConfig) {
            return null;
        }

        // 创建通道
        const channel = this.createChannelFromConfig(name, channelConfig);
        if (channel) {
            this.channels.set(name, channel);
        }

        return channel;
    }

    /**
     * 根据配置创建通道
     */
    private createChannelFromConfig(name: string, config: LogChannelConfig): LogChannelContract | null {
        const configWithName = { ...config, name };

        // 首先检查是否有自定义创建器
        if (this.customCreators.has(config.driver)) {
            return this.customCreators.get(config.driver)!(configWithName);
        }

        // 使用注册的驱动
        const driver = this.drivers.get(config.driver);
        if (driver) {
            return driver.createChannel(configWithName);
        }

        console.warn(`Log driver '${config.driver}' not found`);
        return null;
    }

    /**
     * 获取指定通道
     */
    channel(name?: string): LogChannelContract {
        const channelName = name || this.config.default;

        const channel = this.getChannelInstance(channelName);
        if (!channel) {
            console.warn(`Log channel '${channelName}' not found, using fallback`);
            return this.createFallbackChannel();
        }

        return channel;
    }

    /**
     * 创建备用通道
     */
    private createFallbackChannel(): LogChannelContract {
        const fallbackConfig: LogChannelConfig = {
            driver: 'electron',
            name: 'fallback'
        };

        return this.drivers.get('electron')!.createChannel(fallbackConfig);
    }

    /**
     * 获取默认驱动名称
     */
    getDefaultDriver(): string {
        return this.config.default;
    }

    /**
     * 设置默认驱动
     */
    setDefaultDriver(name: string): void {
        this.config.default = name;
    }

    /**
     * 扩展日志驱动
     */
    extend(driver: string, callback: ChannelFactory): void {
        this.customCreators.set(driver, callback);
    }

    /**
     * 获取所有可用通道名称
     */
    getAvailableChannels(): string[] {
        return Object.keys(this.config.channels);
    }

    /**
     * 动态创建新通道
     */
    createChannel(name: string, config: LogChannelConfig): LogChannelContract {
        const channel = this.createChannelFromConfig(name, config);
        if (!channel) {
            throw new Error(`Failed to create log channel '${name}'`);
        }

        this.channels.set(name, channel);
        return channel;
    }

    /**
     * 带上下文的日志记录器
     */
    withContext(context: LogContext): ContextualLoggerContract {
        const defaultChannel = this.channel();

        return {
            debug: (message: string, additionalContext?: LogContext) => {
                defaultChannel.debug(message, { ...context, ...additionalContext });
            },
            info: (message: string, additionalContext?: LogContext) => {
                defaultChannel.info(message, { ...context, ...additionalContext });
            },
            warn: (message: string, additionalContext?: LogContext) => {
                defaultChannel.warn(message, { ...context, ...additionalContext });
            },
            error: (message: string, additionalContext?: LogContext) => {
                defaultChannel.error(message, { ...context, ...additionalContext });
            }
        };
    }

    /**
     * 默认通道的便捷方法
     */
    debug(message: string, context?: LogContext): void {
        this.channel().debug(message, context);
    }

    info(message: string, context?: LogContext): void {
        this.channel().info(message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.channel().warn(message, context);
    }

    error(message: string, context?: LogContext): void {
        this.channel().error(message, context);
    }
} 