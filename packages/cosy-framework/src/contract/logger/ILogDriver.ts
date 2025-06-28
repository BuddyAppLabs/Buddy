import { ILogChannel } from './ILogChannel.js';
import { ILogChannelConfig } from './ILogChannelConfig.js';

/**
 * 日志驱动工厂契约
 */
export interface ILogDriver {
  createChannel(config: ILogChannelConfig): ILogChannel;
}
