import { LogLevel } from 'electron-log';
import { ILogLevel } from '@coffic/cosy-framework';

const VALID_ELECTRON_LOG_LEVELS: LogLevel[] = [
  'error',
  'warn',
  'info',
  'verbose',
  'debug',
  'silly',
];

export function sanitizeLogLevel(level?: ILogLevel | LogLevel): LogLevel {
  const defaultLevel: LogLevel = 'info';
  if (!level) {
    return defaultLevel;
  }

  // If it's already a valid electron-log level, return it
  if (VALID_ELECTRON_LOG_LEVELS.includes(level as LogLevel)) {
    return level as LogLevel;
  }

  // Map our new levels to electron-log levels
  switch (level) {
    case ILogLevel.EMERGENCY:
    case ILogLevel.ALERT:
    case ILogLevel.CRITICAL:
    case ILogLevel.ERROR:
      return 'error';
    case ILogLevel.WARNING:
      return 'warn';
    case ILogLevel.NOTICE:
    case ILogLevel.INFO:
      return 'info';
    case ILogLevel.DEBUG:
      return 'debug';
    default:
      return defaultLevel;
  }
}
