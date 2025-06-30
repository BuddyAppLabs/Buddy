import { ILogConfig } from '@coffic/cosy-framework';

/**
 * 日志配置接口
 * 继承自框架的 LogConfig 接口，允许用户覆盖默认配置
 */
export interface LoggerConfig extends ILogConfig {
  // 用户可以在这里添加额外的配置项
  // 例如：
  // customDrivers?: Record<string, any>;
  // globalTags?: Record<string, string>;
}
