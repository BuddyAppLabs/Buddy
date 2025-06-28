import { ILogLevel } from '@coffic/cosy-framework';
import { getLogPath } from '../src/main/utils/LogUtil';

export default {
  default: 'stack',

  channels: {
    stack: {
      driver: 'stack',
      channels: ['console', 'file'],
    },
    app: {
      driver: 'file',
      level: ILogLevel.DEBUG,
      path: () => getLogPath('app.log'),
    },

    logMiddleware: {
      driver: 'file',
      level: ILogLevel.DEBUG,
      path: () => getLogPath('logMiddleware.log'),
    },

    console: {
      driver: 'console',
      level: ILogLevel.DEBUG,
    },

    file: {
      driver: 'file',
      level: ILogLevel.DEBUG,
      path: () => getLogPath('buddy.log'),
    },

    updater: {
      driver: 'file',
      level: ILogLevel.DEBUG,
      path: () => getLogPath('updater.log'),
    },

    plugin: {
      driver: 'file',
      level: ILogLevel.DEBUG,
      path: () => getLogPath('plugin.log'),
    },
  },
};
