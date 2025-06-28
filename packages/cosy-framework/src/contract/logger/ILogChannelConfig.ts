import { ILogLevel } from './ILogLevel.js';

/**
 * 日志通道配置接口
 */
export interface ILogChannelConfig {
  driver: string;
  name?: string;
  level?: ILogLevel;
  path?: string | (() => string);
  channels?: string[];
  format?: 'simple' | 'json' | 'structured';
  includeTimestamp?: boolean; // 是否包含时间戳
  [key: string]: any; // 允许扩展配置
}
