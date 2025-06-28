import { LogChannelContract } from './LogChannelContract.js';
import { LogChannelConfig } from './LogChannelConfig.js';

/**
 * 通道工厂类型
 */
export type ChannelFactory = (config: LogChannelConfig) => LogChannelContract; 