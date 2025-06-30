import { ILogLevel } from '@coffic/cosy-framework';

export default {
  default: 'stack',

  channels: {
    stack: {
      driver: 'stack',
      channels: ['console', 'file'],
    },
    app: {
      driver: 'console',
      level: ILogLevel.DEBUG,
    },

    logMiddleware: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    console: {
      driver: 'console',
      level: ILogLevel.DEBUG,
    },

    file: {
      driver: 'file',
      level: ILogLevel.DEBUG,
    },

    updater: {
      driver: 'file',
      level: ILogLevel.DEBUG,
    },

    plugin: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },
  },
};
