/**
 * 日志级别枚举
 * 遵循 RFC 5424 规范:
 * emergency, alert, critical, error, warning, notice, info, debug
 */
export enum ILogLevel {
  EMERGENCY = 'emergency',
  ALERT = 'alert',
  CRITICAL = 'critical',
  ERROR = 'error',
  WARNING = 'warning',
  NOTICE = 'notice',
  INFO = 'info',
  DEBUG = 'debug',
}
