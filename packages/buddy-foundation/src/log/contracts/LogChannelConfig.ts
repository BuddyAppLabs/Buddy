import { LogLevel } from './LogLevel.js';

/**
 * 日志通道配置接口
 */
export interface LogChannelConfig {
    driver: string;
    name?: string;
    level?: LogLevel;
    path?: string;
    channels?: string[];
    format?: 'simple' | 'json' | 'structured';
    includeTimestamp?: boolean; // 是否包含时间戳
    [key: string]: any; // 允许扩展配置
} 