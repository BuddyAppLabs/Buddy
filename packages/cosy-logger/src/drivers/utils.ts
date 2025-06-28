import { LogLevel } from 'electron-log';
import { ILogLevel } from '@coffic/cosy-framework';

const VALID_LEVELS: LogLevel[] = [
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
  if (VALID_LEVELS.includes(level as LogLevel)) {
    return level as LogLevel;
  }
  // For safety, if an invalid level is passed, default to 'info'
  return defaultLevel;
}
