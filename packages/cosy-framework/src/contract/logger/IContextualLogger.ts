/**
 * 上下文日志记录器契约
 */
export interface IContextualLogger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}
