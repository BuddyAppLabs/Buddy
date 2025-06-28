/**
 * 日志工具类
 * 提供日志相关的通用工具函数和日志记录功能
 */
import log from 'electron-log/main.js';
import type { Format } from 'electron-log';
import 'source-map-support/register';
import { SuperLogger } from '@coffic/buddy-types';
import { app } from 'electron';
import path from 'path';

log.initialize();
// 配置日志级别对应的颜色和表情
const logStyles = {
  error: { emoji: '❌', color: '\x1b[31m' }, // 红色
  warn: { emoji: '🔮', color: '\x1b[33m' }, // 黄色
  info: { emoji: '🍋', color: '\x1b[36m' }, // 青色
  debug: { emoji: '🔍', color: '\x1b[90m' }, // 灰色
};

const resetColor = '\x1b[0m';

/**
 * 将日志数据格式化为适合显示的字符串
 * @param data 日志数据
 * @returns 格式化后的字符串
 */
function formatLogData(data: any[]): string {
  return data
    .map((item) => {
      if (typeof item === 'object' && item !== null) {
        try {
          return JSON.stringify(item, null, 2);
        } catch (e) {
          return String(item);
        }
      }
      return String(item);
    })
    .join(' ');
}

// 配置日志
if (process.env.NODE_ENV === 'development') {
  // 开发环境：显示源码位置（绝对路径）
  log.transports.file.format = ((message) => {
    const style = logStyles[message.level] || { emoji: '📝' };
    const text = formatLogData(message.data);
    return [`[{h}:{i}:{s}] ${style.emoji} ${text}`];
  }) as Format;

  log.transports.console.format = ((message) => {
    const style = logStyles[message.level] || {
      emoji: '📝',
      color: '\x1b[37m',
    };
    const text = formatLogData(message.data);
    return [`${style.color}${style.emoji} ${text}${resetColor}`];
  }) as Format;

  // 配置日志作用域格式
  log.hooks.push((message) => {
    if (message.data[0]?.['__filename']) {
      const file = message.data[0]['__filename'];
      const line = message.data[0]['__line'];
      const locationInfo = `[${file}:${line}]`;
      message.data = [locationInfo, ...message.data.slice(1)];
    }
    return message;
  });
} else {
  // 生产环境：不显示源码位置
  log.transports.file.format = ((message) => {
    const style = logStyles[message.level] || { emoji: '📝' };
    const text = formatLogData(message.data);
    return [`[{h}:{i}:{s}] ${style.emoji} ${text}`];
  }) as Format;

  log.transports.console.format = ((message) => {
    const style = logStyles[message.level] || {
      emoji: '📝',
      color: '\x1b[37m',
    };
    const text = formatLogData(message.data);
    return [`${style.color}${style.emoji} ${text}${resetColor}`];
  }) as Format;
}

// 设置日志级别
log.transports.file.level = 'info';
log.transports.console.level =
  process.env.NODE_ENV === 'development' ? 'debug' : 'info';

export class LogUtil {
  /**
   * 创建一个日志记录器
   * @returns SuperLogger实例
   */
  static createLogger(): SuperLogger {
    const logWithLocation = (level: string, ...params: any[]) => {
      // 获取调用位置信息
      const error = new Error();
      const stack = error.stack?.split('\n')[3] || '';
      const match =
        stack.match(/at\s+.*\s+\((.+):(\d+):(\d+)\)/) ||
        stack.match(/at\s+(.+):(\d+):(\d+)/);

      if (process.env.NODE_ENV === 'development' && match) {
        const [, file, line] = match;
        // 移除文件路径中的 file:// 前缀
        const cleanFile = file.replace(/^file:\/\//, '');
        // 将位置信息作为第一个参数传递
        log[level]({ __filename: cleanFile, __line: line }, ...params);
      } else {
        log[level](...params);
      }
    };

    return {
      error: (...params: any[]) => {
        logWithLocation('error', ...params);
      },
      warn: (...params: any[]) => {
        logWithLocation('warn', ...params);
      },
      info: (...params: any[]) => {
        logWithLocation('info', ...params);
      },
      debug: (...params: any[]) => {
        logWithLocation('debug', ...params);
      },
    };
  }
}

/**
 * 获取日志文件的完整路径。
 * 在开发环境中，日志将存储在项目根目录下的 'logs' 文件夹中。
 * 在生产环境中，日志将存储在 Electron 的标准用户数据日志目录中。
 * @param fileName - 日志文件的名称 (例如, 'buddy.log')
 * @returns 日志文件的完整路径
 */
export function getLogPath(fileName: string): string {
  if (app.isPackaged) {
    // 生产环境: 返回用户数据目录下的logs目录
    // 例如: /Users/username/Library/Application Support/AppName/logs/buddy.log
    return path.join(app.getPath('logs'), fileName);
  } else {
    // 开发环境: 返回项目根目录下的logs目录
    // 例如: /path/to/your/project/logs/buddy.log
    return path.join(app.getAppPath(), 'logs', fileName);
  }
}
