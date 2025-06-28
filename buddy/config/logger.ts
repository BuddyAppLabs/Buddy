import { ILogLevel } from '@coffic/cosy-framework';
import { LoggerConfig } from '@coffic/cosy-logger';

export const loggerConfig: LoggerConfig = {
  default: 'app', // 修改默认通道
  channels: {
    app: {
      driver: 'electron',
      level: ILogLevel.DEBUG, // 覆盖默认级别
      format: 'json', // 修改输出格式
      includeTimestamp: true, // 添加时间戳
    },
    logMiddleware: {
      driver: 'electron',
      level: ILogLevel.INFO,
      format: 'simple',
    },
    plugin: {
      driver: 'electron',
      level: ILogLevel.INFO,
      format: 'simple',
    },
    window: {
      driver: 'electron',
      level: ILogLevel.INFO,
      format: 'simple',
    },
  },
};
