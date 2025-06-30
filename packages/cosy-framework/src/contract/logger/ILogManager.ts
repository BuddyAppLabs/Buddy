import { ILogChannel } from './ILogChannel.js';
import { IChannelFactory } from './IChannelFactory.js';
import { ILogChannelConfig } from './ILogChannelConfig.js';
import { ILogContext } from './ILogContext.js';
import { IContextualLogger } from './IContextualLogger.js';

/**
 * 日志管理器契约
 */
export interface ILogManager {
  channel(name?: string): ILogChannel;
  getDefaultDriver(): string;
  setDefaultDriver(name: string): void;
  extend(driver: string, callback: IChannelFactory): void;
  getAvailableChannels(): string[];
  createChannel(name: string, config: ILogChannelConfig): ILogChannel;
  withContext(context: ILogContext): IContextualLogger;
  emergency(message: string, context?: ILogContext): void;
  alert(message: string, context?: ILogContext): void;
  critical(message: string, context?: ILogContext): void;
  error(message: string, context?: ILogContext): void;
  warning(message: string, context?: ILogContext): void;
  notice(message: string, context?: ILogContext): void;
  info(message: string, context?: ILogContext): void;
  debug(message: string, context?: ILogContext): void;
}
