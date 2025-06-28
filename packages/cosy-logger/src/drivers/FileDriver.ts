import log, {
  type LogLevel,
  type LogMessage,
  type Transport,
} from 'electron-log';
import {
  ILogChannel,
  ILogChannelConfig,
  ILogContext,
  ILogDriver,
  ILogLevel,
} from '@coffic/cosy-framework';
import { sanitizeLogLevel } from './utils.js';

export class FileChannel implements ILogChannel {
  private logger: any;
  private config: ILogChannelConfig;
  private channelName: string;

  constructor(name: string, config: ILogChannelConfig) {
    this.channelName = name;
    this.config = config;
    this.logger = log.create({ logId: `file_${name}` });
    this.logger.transports.file.fileName = `${name}.log`;
    this.logger.transports.console.level = false; // Disable console output for file driver

    const sanitizedLevel = sanitizeLogLevel(this.config.level);
    this.logger.transports.file.level = sanitizedLevel;
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

export class FileDriver implements ILogDriver {
  createChannel(config: ILogChannelConfig): ILogChannel {
    return new FileChannel(config.name || 'default_file', config);
  }
}
