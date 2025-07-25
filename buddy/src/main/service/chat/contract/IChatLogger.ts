export interface IChatLogger {
  info(message: string): void;
  error(message: string, context?: any): void;
}
