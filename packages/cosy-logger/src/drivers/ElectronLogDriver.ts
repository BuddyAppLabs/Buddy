/**
 * Electron Log 驱动实现
 * 基于 electron-log 的具体日志驱动
 */
import {
  LogDriverContract,
  LogChannelContract,
  LogChannelConfig,
  LogLevel,
  LogContext,
} from '@coffic/cosy-framework';
import log, { type LogFunctions } from 'electron-log';

export class ElectronLogChannel implements LogChannelContract {
  private logger: any;
  private config: LogChannelConfig;
  private channelName: string;

  constructor(name: string, config: LogChannelConfig) {
    this.channelName = name;
    this.config = config;
    this.logger = log.create({ logId: name });

    //
    this.logger.transports.file.fileName = `${name}.log`;

    // file an console
    this.logger.transports.file.level = this.config.level || 'info';
    this.logger.transports.console.level = this.config.level || 'info';
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
    const contextStr = context ? [context] : [];

    switch (level) {
      case LogLevel.DEBUG:
        this.logger.debug(message, ...contextStr);
        break;
      case LogLevel.INFO:
        this.logger.info(message, ...contextStr);
        break;
      case LogLevel.WARN:
        this.logger.warn(message, ...contextStr);
        break;
      case LogLevel.ERROR:
        this.logger.error(message, ...contextStr);
        break;
      default:
        this.logger.info(message, ...contextStr);
        break;
    }
  }
}

export class ElectronLogDriver implements LogDriverContract {
  createChannel(config: LogChannelConfig): LogChannelContract {
    return new ElectronLogChannel(config.name || 'default', config);
  }
}
