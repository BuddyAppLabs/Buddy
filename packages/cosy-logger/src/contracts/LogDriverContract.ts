import { LogChannelContract } from './LogChannelContract.js';
import { LogChannelConfig } from './LogChannelConfig.js';

/**
 * 日志驱动工厂契约
 */
export interface LogDriverContract {
    createChannel(config: LogChannelConfig): LogChannelContract;
} 