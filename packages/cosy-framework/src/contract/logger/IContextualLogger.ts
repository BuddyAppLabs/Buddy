import { ILogContext } from './ILogContext.js';

/**
 * 上下文日志记录器接口
 * 定义了在特定上下文中记录日志的方法
 */
export interface IContextualLogger {
  emergency(message: string): void;
  alert(message: string): void;
  critical(message: string): void;
  error(message: string): void;
  warning(message: string): void;
  notice(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}
