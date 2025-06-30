import { ILogChannel } from './ILogChannel.js';
import { ILogChannelConfig } from './ILogChannelConfig.js';

/**
 * 通道工厂类型
 */
export type IChannelFactory = (config: ILogChannelConfig) => ILogChannel;
