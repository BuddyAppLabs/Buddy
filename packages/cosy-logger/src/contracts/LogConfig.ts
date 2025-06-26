import { LogChannelConfig } from './LogChannelConfig.js';

/**
 * 日志配置接口
 */
export interface LogConfig {
    default: string;
    channels: {
        [key: string]: LogChannelConfig;
    };
} 