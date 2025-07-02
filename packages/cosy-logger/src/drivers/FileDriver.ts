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

    // 获取 electron-log 的默认日志目录
    const defaultPath = this.logger.transports.file.getFile().path;
    const logDir = path.dirname(defaultPath);

    // 为当前通道构建一个专属的日志文件路径
    const channelLogPath = path.join(logDir, `${name}.log`);

    // 确保日志目录存在
    fs.mkdirSync(logDir, { recursive: true });

    // 覆盖 electron-log 的默认路径解析逻辑，使用我们自定义的路径
    this.logger.transports.file.resolvePathFn = () => channelLogPath;

    // 打印最终的日志文件位置
    console.log(
      `[cosy-logger] 📝 File log channel '${name}' will write to: ${channelLogPath}`
    );
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
