/**
 * 日志管理器 - 基于服务容器的实现
 * 参考Laravel的设计，支持依赖注入、驱动扩展和灵活配置
 */
import {
  ILogChannel,
  ILogChannelConfig,
  ILogConfig,
  ILogContext,
  ILogDriver,
  ILogManager,
  IContextualLogger,
  IChannelFactory,
  ILogLevel,
} from '@coffic/cosy-framework';
import { ConsoleDriver } from './drivers/ConsoleDriver.js';
import { FileDriver } from './drivers/FileDriver.js';
import { StackDriver } from './drivers/StackDriver.js';

class ContextualLogger implements IContextualLogger {
  constructor(
    private channel: ILogChannel,
    private context: ILogContext
  ) {}

  emergency(message: string): void {
    this.channel.emergency(message, this.context);
  }
  alert(message: string): void {
    this.channel.alert(message, this.context);
  }
  critical(message: string): void {
    this.channel.critical(message, this.context);
  }
  error(message: string): void {
    this.channel.error(message, this.context);
  }
  warning(message: string): void {
    this.channel.warning(message, this.context);
  }
  warn(message: string): void {
    this.warning(message);
  }
  notice(message: string): void {
    this.channel.notice(message, this.context);
  }
  info(message: string): void {
    this.channel.info(message, this.context);
  }
  debug(message: string): void {
    this.channel.debug(message, this.context);
  }
}

export class LogManager implements ILogManager {
  private config: ILogConfig;
  private drivers: Map<string, ILogDriver> = new Map();
  private channels: Map<string, ILogChannel> = new Map();
  private customCreators: Map<string, IChannelFactory> = new Map();

  constructor(config: ILogConfig) {
    this.config = config;
    this.registerDefaultDrivers();
  }

  /**
   * 注册默认驱动
   */
  private registerDefaultDrivers(): void {
    // 注册驱动
    this.drivers.set('console', new ConsoleDriver());
    this.drivers.set('file', new FileDriver());

    // 注册stack驱动 - 需要传入channel解析器
    this.drivers.set(
      'stack',
      new StackDriver((name: string) => this.getChannelInstance(name))
    );
  }

  /**
   * 获取通道实例
   */
  private getChannelInstance(name: string): ILogChannel | null {
    // 如果通道已经存在，直接返回
    if (this.channels.has(name)) {
      return this.channels.get(name)!;
    }

    // 获取通道配置
    const config = this.config.channels[name];
    if (!config) {
      return null;
    }

    // 创建新通道
    const channel = this.createChannelFromConfig(name, config);
    if (channel) {
      this.channels.set(name, channel);
    }

    return channel;
  }

  /**
   * 根据配置创建通道
   */
  private createChannelFromConfig(
    name: string,
    config: ILogChannelConfig
  ): ILogChannel | null {
    // If driver is null or the string 'null', return a silent, "black hole" channel.
    if (config.driver === null || config.driver === 'null') {
      return this.createNullChannel();
    }

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
   * Creates a null channel that does nothing.
   */
  private createNullChannel(): ILogChannel {
    return {
      emergency: () => {},
      alert: () => {},
      critical: () => {},
      error: () => {},
      warning: () => {},
      warn: () => {},
      notice: () => {},
      info: () => {},
      debug: () => {},
      log: () => {},
    };
  }

  /**
   * 获取指定通道
   */
  channel(name?: string): ILogChannel {
    const channelName = name || this.config.default;

    const channel = this.getChannelInstance(channelName);
    if (!channel) {
      console.warn(
        `🚨 Log channel '${channelName}' not found, using fallback 🚨`
      );
      return this.createFallbackChannel();
    }

    return channel;
  }

  /**
   * 创建备用通道
   * 如果连备用通道都创建失败，则返回一个静默的空壳通道，并打印严重错误
   */
  private createFallbackChannel(): ILogChannel {
    const driver = this.drivers.get('console');
    if (!driver) {
      console.error(
        '🚨 FATAL: Log system fallback failed. The default console driver is not registered. All logs will be suppressed.'
      );
      // 返回一个什么都不做的空壳对象，以防止应用崩溃
      return this.createNullChannel();
    }

    const fallbackConfig: ILogChannelConfig = {
      driver: 'console',
      name: 'fallback',
      level: ILogLevel.DEBUG,
    };

    return driver.createChannel(fallbackConfig);
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
  extend(driver: string, callback: IChannelFactory): void {
    this.customCreators.set(driver, callback);
  }

  /**
   * 获取可用的通道列表
   */
  getAvailableChannels(): string[] {
    return Object.keys(this.config.channels);
  }

  /**
   * 动态创建新通道
   */
  createChannel(name: string, config: ILogChannelConfig): ILogChannel {
    const channel = this.createChannelFromConfig(name, config);
    if (!channel) {
      throw new Error(`Failed to create log channel '${name}'`);
    }

    this.channels.set(name, channel);
    return channel;
  }

  /**
   * 创建带上下文的日志记录器
   */
  withContext(context: ILogContext): IContextualLogger {
    return new ContextualLogger(this.channel(), context);
  }

  emergency(message: string, context?: ILogContext): void {
    this.channel().emergency(message, context);
  }
  alert(message: string, context?: ILogContext): void {
    this.channel().alert(message, context);
  }
  critical(message: string, context?: ILogContext): void {
    this.channel().critical(message, context);
  }
  error(message: string, context?: ILogContext): void {
    this.channel().error(message, context);
  }
  warning(message: string, context?: ILogContext): void {
    this.channel().warning(message, context);
  }
  warn(message: string, context?: ILogContext): void {
    this.warning(message, context);
  }
  notice(message: string, context?: ILogContext): void {
    this.channel().notice(message, context);
  }
  info(message: string, context?: ILogContext): void {
    this.channel().info(message, context);
  }
  debug(message: string, context?: ILogContext): void {
    this.channel().debug(message, context);
  }
}
