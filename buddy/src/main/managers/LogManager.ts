/**
 * 日志管理器
 * 参考Laravel的设计，支持多通道、配置管理、上下文日志等功能
 * 提供统一的日志接口和灵活的配置选项
 */
import log from 'electron-log/main.js';
import type { Format } from 'electron-log';
import { SuperLogger } from '@coffic/buddy-types';
import { LogUtil } from '../utils/LogUtil.js';

// 日志级别枚举
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// 日志通道配置接口
export interface LogChannelConfig {
  driver: 'file' | 'console' | 'stack';
  level?: LogLevel;
  path?: string;
  channels?: string[]; // 用于stack类型
  format?: 'simple' | 'json' | 'structured';
}

// 日志配置接口
export interface LogConfig {
  defaultChannel: string;
  channels: Record<string, LogChannelConfig>;
}

// 日志上下文接口
export interface LogContext {
  [key: string]: any;
}

// 单个日志通道类
class LogChannel {
  private logger: SuperLogger;
  private config: LogChannelConfig;
  private channelName: string;

  constructor(name: string, config: LogChannelConfig) {
    this.channelName = name;
    this.config = config;
    this.logger = this.createLogger();
  }

  private createLogger(): SuperLogger {
    if (this.config.driver === 'stack') {
      // Stack类型将在LogManager中处理
      return LogUtil.createLogger();
    }

    // 为不同通道创建独立的logger实例
    return LogUtil.createLogger();
  }

  /**
   * 记录日志消息
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
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
          .map(([key, value]) => `${key}=${value}`)
          .join(' ');
        formatted += ` {${contextStr}}`;
      } else {
        // simple format
        formatted += ` ${JSON.stringify(context)}`;
      }
    }

    return formatted;
  }

  // 便捷方法
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
}

// Stack通道类 - 支持多通道组合
class StackChannel extends LogChannel {
  private channels: LogChannel[] = [];

  constructor(name: string, config: LogChannelConfig, channelInstances: Map<string, LogChannel>) {
    super(name, config);

    // 获取stack中配置的通道实例
    if (config.channels) {
      this.channels = config.channels
        .map(channelName => channelInstances.get(channelName))
        .filter((channel): channel is LogChannel => channel !== undefined);
    }
  }

  log(level: LogLevel, message: string, context?: LogContext): void {
    // 将日志发送到stack中的所有通道
    this.channels.forEach(channel => {
      channel.log(level, message, context);
    });
  }
}

/**
 * 日志管理器主类 - 参考Laravel设计
 */
export class LogManager {
  private config: LogConfig;
  private channels: Map<string, LogChannel> = new Map();
  private defaultLogger: LogChannel;

  constructor(config?: LogConfig) {
    this.config = config || this.getDefaultConfig();
    this.initializeChannels();
    this.defaultLogger = this.channels.get(this.config.defaultChannel) || this.createFallbackLogger();
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): LogConfig {
    return {
      defaultChannel: 'app',
      channels: {
        app: {
          driver: 'file',
          level: LogLevel.INFO,
          format: 'structured'
        },
        debug: {
          driver: 'console',
          level: LogLevel.DEBUG,
          format: 'simple'
        },
        error: {
          driver: 'file',
          level: LogLevel.ERROR,
          format: 'json'
        },
        plugin: {
          driver: 'file',
          level: LogLevel.INFO,
          format: 'structured'
        },
        security: {
          driver: 'file',
          level: LogLevel.WARN,
          format: 'json'
        },
        performance: {
          driver: 'file',
          level: LogLevel.INFO,
          format: 'structured'
        },
        // Stack示例 - 同时记录到多个通道
        production: {
          driver: 'stack',
          channels: ['app', 'error']
        }
      }
    };
  }

  /**
   * 初始化所有通道
   */
  private initializeChannels(): void {
    // 首先创建非stack类型的通道
    for (const [name, config] of Object.entries(this.config.channels)) {
      if (config.driver !== 'stack') {
        this.channels.set(name, new LogChannel(name, config));
      }
    }

    // 然后创建stack类型的通道
    for (const [name, config] of Object.entries(this.config.channels)) {
      if (config.driver === 'stack') {
        this.channels.set(name, new StackChannel(name, config, this.channels));
      }
    }
  }

  /**
   * 创建备用logger
   */
  private createFallbackLogger(): LogChannel {
    return new LogChannel('fallback', {
      driver: 'console',
      level: LogLevel.INFO,
      format: 'simple'
    });
  }

  /**
   * 获取指定通道的logger
   */
  channel(name: string): LogChannel {
    const channel = this.channels.get(name);
    if (!channel) {
      console.warn(`Logger channel '${name}' not found, using default channel`);
      return this.defaultLogger;
    }
    return channel;
  }

  /**
   * 动态创建新通道
   */
  createChannel(name: string, config: LogChannelConfig): LogChannel {
    const channel = new LogChannel(name, config);
    this.channels.set(name, channel);
    return channel;
  }

  /**
   * 获取所有可用通道名称
   */
  getAvailableChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * 默认通道的便捷方法
   */
  debug(message: string, context?: LogContext): void {
    this.defaultLogger.debug(message, context);
  }

  info(message: string, context?: LogContext): void {
    this.defaultLogger.info(message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.defaultLogger.warn(message, context);
  }

  error(message: string, context?: LogContext): void {
    this.defaultLogger.error(message, context);
  }

  /**
   * 带上下文的日志记录 - Laravel风格
   */
  withContext(context: LogContext) {
    return {
      debug: (message: string, additionalContext?: LogContext) => {
        this.debug(message, { ...context, ...additionalContext });
      },
      info: (message: string, additionalContext?: LogContext) => {
        this.info(message, { ...context, ...additionalContext });
      },
      warn: (message: string, additionalContext?: LogContext) => {
        this.warn(message, { ...context, ...additionalContext });
      },
      error: (message: string, additionalContext?: LogContext) => {
        this.error(message, { ...context, ...additionalContext });
      }
    };
  }
}

// 注意：现在推荐使用服务容器和Facade模式来访问日志服务
// 这些导出主要用于向后兼容

// 从Facade导入logger实例 - 向后兼容
export { logger } from '../facades/Log.js';

// 便捷的日志通道访问 - 通过Facade
import { Log } from '../facades/Log.js';

// 创建便捷的通道访问函数
export const getAppLogger = () => Log.channel('app');
export const getDebugLogger = () => Log.channel('debug');
export const getErrorLogger = () => Log.channel('error');
export const getPluginLogger = () => Log.channel('plugin');
export const getSecurityLogger = () => Log.channel('security');
export const getPerformanceLogger = () => Log.channel('performance');
