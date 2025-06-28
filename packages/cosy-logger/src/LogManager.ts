/**
 * 日志管理器 - 基于服务容器的实现
 * 参考Laravel的设计，支持依赖注入、驱动扩展和灵活配置
 */
import {
  ILogManager,
  ILogChannel,
  ILogDriver,
  ILogChannelConfig,
  ILogConfig,
  ILogContext,
  IContextualLogger,
  IChannelFactory,
} from '@coffic/cosy-framework';
import { ElectronLogDriver } from './drivers/ElectronLogDriver.js';
import { StackDriver } from './drivers/StackDriver.js';

class ContextualLogger implements IContextualLogger {
  constructor(
    private channel: ILogChannel,
    private context: ILogContext
  ) {}

  debug(message: string): void {
    this.channel.debug(message, this.context);
  }

  info(message: string): void {
    this.channel.info(message, this.context);
  }

  warn(message: string): void {
    this.channel.warn(message, this.context);
  }

  error(message: string): void {
    this.channel.error(message, this.context);
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
    // 注册electron-log驱动
    this.drivers.set('electron', new ElectronLogDriver());

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
  channel(name?: string): ILogChannel {
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
  private createFallbackChannel(): ILogChannel {
    const fallbackConfig: ILogChannelConfig = {
      driver: 'electron',
      name: 'fallback',
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

  /**
   * 便捷方法：记录调试日志
   */
  debug(message: string, context?: ILogContext): void {
    this.channel().debug(message, context);
  }

  /**
   * 便捷方法：记录信息日志
   */
  info(message: string, context?: ILogContext): void {
    this.channel().info(message, context);
  }

  /**
   * 便捷方法：记录警告日志
   */
  warn(message: string, context?: ILogContext): void {
    this.channel().warn(message, context);
  }

  /**
   * 便捷方法：记录错误日志
   */
  error(message: string, context?: ILogContext): void {
    this.channel().error(message, context);
  }
}
