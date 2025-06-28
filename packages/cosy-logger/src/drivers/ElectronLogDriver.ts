/**
 * Electron Log 驱动实现
 * 基于 electron-log 的具体日志驱动
 */
import log, { type LogFunctions, type LogLevel } from 'electron-log';
import {
  ILogChannel,
  ILogChannelConfig,
  ILogContext,
  ILogDriver,
  ILogLevel,
} from '@coffic/cosy-framework';
import chalk from 'chalk';

const SILLY_LEVEL = 'silly';
const VALID_LEVELS: LogLevel[] = [
  'error',
  'warn',
  'info',
  'verbose',
  'debug',
  'silly',
];

function sanitizeLogLevel(level?: ILogLevel | LogLevel): LogLevel {
  const defaultLevel: LogLevel = 'info';
  if (!level) {
    return defaultLevel;
  }
  if (VALID_LEVELS.includes(level as LogLevel)) {
    return level as LogLevel;
  }
  // For safety, if an invalid level is passed, default to 'info'
  return defaultLevel;
}

export class ElectronLogChannel implements ILogChannel {
  private logger: any;
  private config: ILogChannelConfig;
  private channelName: string;

  constructor(name: string, config: ILogChannelConfig) {
    this.channelName = name;
    this.config = config;
    this.logger = log.create({ logId: name });
    this.logger.transports.file.fileName = `${name}.log`;

    const sanitizedLevel = sanitizeLogLevel(this.config.level);

    // file an console
    this.logger.transports.file.level = sanitizedLevel;
    this.logger.transports.console.level = sanitizedLevel;
  }

  debug(message: string, context?: ILogContext): void {
    this.log(ILogLevel.DEBUG, message, context);
  }

  info(message: string, context?: ILogContext): void {
    this.log(ILogLevel.INFO, message, context);
  }

  warn(message: string, context?: ILogContext): void {
    this.log(ILogLevel.WARN, message, context);
  }

  error(message: string, context?: ILogContext): void {
    this.log(ILogLevel.ERROR, message, context);
  }

  log(level: ILogLevel, message: string, context?: ILogContext): void {
    const contextStr = context ? [context] : [];

    switch (level) {
      case ILogLevel.DEBUG:
        this.logger.debug(message, ...contextStr);
        break;
      case ILogLevel.INFO:
        this.logger.info(message, ...contextStr);
        break;
      case ILogLevel.WARN:
        this.logger.warn(message, ...contextStr);
        break;
      case ILogLevel.ERROR:
        this.logger.error(message, ...contextStr);
        break;
      default:
        this.logger.info(message, ...contextStr);
        break;
    }
  }
}

export class ElectronLogDriver implements ILogDriver {
  createChannel(config: ILogChannelConfig): ILogChannel {
    return new ElectronLogChannel(config.name || 'default', config);
  }
}
