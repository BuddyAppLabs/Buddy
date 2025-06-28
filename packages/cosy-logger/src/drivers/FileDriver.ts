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
import path from 'path';
import fs from 'fs';

export class FileChannel implements ILogChannel {
  private logger: any;
  private config: ILogChannelConfig;
  private channelName: string;

  constructor(name: string, config: ILogChannelConfig) {
    this.channelName = name;
    this.config = config;
    this.logger = log.create({ logId: `file_${name}` });
    this.logger.transports.console.level = false; // Disable console output for file driver

    const sanitizedLevel = sanitizeLogLevel(this.config.level);
    this.logger.transports.file.level = sanitizedLevel;

    // If a custom path is provided, use it
    if (this.config.path) {
      const pathOrFn = this.config.path;
      const logPath =
        typeof pathOrFn === 'function'
          ? (pathOrFn as () => string)()
          : (pathOrFn as string);

      // Ensure the directory exists
      const logDir = path.dirname(logPath);
      fs.mkdirSync(logDir, { recursive: true });

      // Override electron-log's default path resolving
      this.logger.transports.file.resolvePathFn = () => logPath;

      console.log(
        `[cosy-logger] 📝 File log channel '${name}' configured to write to: ${logPath}`
      );
      // 诊断：打印 electron-log 内部认为的最终文件路径
      const fileInfo = this.logger.transports.file.getFile();
      console.log(
        `[cosy-logger] 🔍 [${name}] electron-log internal path:`,
        fileInfo.path
      );
    }
  }

  emergency(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.EMERGENCY, message, context);
  }
  alert(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.ALERT, message, context);
  }
  critical(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.CRITICAL, message, context);
  }
  error(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.ERROR, message, context);
  }
  warning(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.WARNING, message, context);
  }
  warn(message: string, context?: ILogContext | undefined): void {
    this.warning(message, context);
  }
  notice(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.NOTICE, message, context);
  }
  info(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.INFO, message, context);
  }
  debug(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.DEBUG, message, context);
  }

  log(level: ILogLevel, message: string, context?: ILogContext): void {
    const contextStr = context ? [context] : [];

    switch (level) {
      case ILogLevel.EMERGENCY:
      case ILogLevel.ALERT:
      case ILogLevel.CRITICAL:
      case ILogLevel.ERROR:
        this.logger.error(message, ...contextStr);
        break;
      case ILogLevel.WARNING:
        this.logger.warn(message, ...contextStr);
        break;
      case ILogLevel.NOTICE:
      case ILogLevel.INFO:
        this.logger.info(message, ...contextStr);
        break;
      case ILogLevel.DEBUG:
        this.logger.debug(message, ...contextStr);
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
