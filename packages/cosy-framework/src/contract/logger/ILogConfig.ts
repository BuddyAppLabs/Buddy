import { ILogChannelConfig } from './ILogChannelConfig.js';

/**
 * 日志配置接口
 */
export interface ILogConfig {
  default: string;
  channels: {
    [key: string]: ILogChannelConfig;
  };
}
