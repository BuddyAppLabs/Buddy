import { ILogLevel } from './ILogLevel.js';
import { ILogContext } from './ILogContext.js';

/**
 * 日志通道契约
 */
export interface ILogChannel {
  emergency(message: string, context?: ILogContext): void;
  alert(message: string, context?: ILogContext): void;
  critical(message: string, context?: ILogContext): void;
  error(message: string, context?: ILogContext): void;
  warning(message: string, context?: ILogContext): void;
  warn(message: string, context?: ILogContext): void;
  notice(message: string, context?: ILogContext): void;
  info(message: string, context?: ILogContext): void;
  debug(message: string, context?: ILogContext): void;
  log(level: ILogLevel, message: string, context?: ILogContext): void;
}
