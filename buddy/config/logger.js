import { ILogLevel } from '@coffic/cosy-framework';

export default {
  default: 'stack',

  channels: {
    stack: {
      driver: 'stack',
      channels: ['console', 'file'],
    },

    ai: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    action: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    app: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    logMiddleware: {
      driver: 'stack',
      level: ILogLevel.DEBUG,
    },

    console: {
      driver: 'console',
      level: ILogLevel.DEBUG,
    },

    market: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    file: {
      driver: 'file',
      level: ILogLevel.DEBUG,
    },

    updater: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    package: {
      driver: 'file',
      level: ILogLevel.DEBUG,
    },

    plugin: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    pluginView: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    state: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    view: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },
  },
};
