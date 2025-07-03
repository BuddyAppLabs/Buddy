import { ILogLevel } from '@coffic/cosy-framework';

export default {
  default: 'stack',

  channels: {
    stack: {
      driver: 'stack',
      channels: ['console', 'file'],
    },

    ai: {
      driver: 'console',
      level: ILogLevel.DEBUG,
    },

    action: {
      driver: 'console',
      level: ILogLevel.DEBUG,
    },

    app: {
      driver: 'console',
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
      driver: 'console',
      level: ILogLevel.DEBUG,
    },

    file: {
      driver: 'file',
      level: ILogLevel.DEBUG,
    },

    updater: {
      driver: 'console',
      level: ILogLevel.DEBUG,
    },

    plugin: {
      driver: 'console',
      level: ILogLevel.DEBUG,
    },

    pluginView: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    state: {
      driver: 'console',
      level: ILogLevel.DEBUG,
    },

    view: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },
  },
};
