import { ILogLevel, ILogConfig } from '@coffic/cosy-framework';

export const loggerConfig: ILogConfig = {
  default: 'stack',
  channels: {
    stack: {
      driver: 'stack',
      channels: ['file', 'console'],
    },
    console: {
      driver: 'console',
      level: ILogLevel.DEBUG,
    },
    file: {
      driver: 'file',
      level: ILogLevel.DEBUG,
    },
  },
};
