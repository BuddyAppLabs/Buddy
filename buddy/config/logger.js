import { ILogLevel } from '@coffic/cosy-framework';

export default {
  default: 'stack',

  channels: {
    stack: {
      driver: 'stack',
      channels: ['console', 'file'],
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
      driver: 'null',
      level: ILogLevel.DEBUG,
    },

    plugin: {
      driver: 'null',
      level: ILogLevel.DEBUG,
    },
  },
};
