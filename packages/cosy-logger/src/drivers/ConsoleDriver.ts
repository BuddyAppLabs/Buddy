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
import chalk from 'chalk';
import { sanitizeLogLevel } from './utils.js';

export class ConsoleChannel implements ILogChannel {
  private logger: any;
  private config: ILogChannelConfig;
  private channelName: string;

  constructor(name: string, config: ILogChannelConfig) {
    this.channelName = name;
    this.config = config;
    this.logger = log.create({ logId: `console_${name}` });
    this.logger.transports.file.level = false; // Disable file output for console driver

    const sanitizedLevel = sanitizeLogLevel(this.config.level);
    this.logger.transports.console.level = sanitizedLevel;
    this.logger.transports.console.format =
      '[{h}:{i}:{s}.{ms}] [{level}] {text}';

    this.logger.hooks.push(
      (message: LogMessage, transport: Transport, transportName: string) => {
        if (transportName === 'console') {
          const { data, level } = message;
          let text = data[0];
          const context = data.slice(1);

          const colorizer = {
            info: chalk.green,
            warn: chalk.yellow,
            error: chalk.red,
            debug: chalk.blue,
            verbose: chalk.cyan,
            silly: chalk.magenta,
          }[level];

          if (colorizer) {
            text = colorizer(text);
          }

          if (context.length > 0) {
            const contextStr = chalk.gray(
              context
                .map((d: any) =>
                  typeof d === 'object' ? JSON.stringify(d, null, 2) : String(d)
                )
                .join(' ')
            );

            message.data[0] = `${text} ${contextStr}`;
            message.data.splice(1);
          } else {
            message.data[0] = text;
          }
        }

        return message;
      }
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

export class ConsoleDriver implements ILogDriver {
  createChannel(config: ILogChannelConfig): ILogChannel {
    return new ConsoleChannel(config.name || 'default_console', config);
  }
}
