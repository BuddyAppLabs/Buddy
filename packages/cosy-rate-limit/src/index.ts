import { IpcMainInvokeEvent } from 'electron';
import { IMiddleware } from '@coffic/cosy-framework';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * 频率限制中间件工厂函数
 */
export function RateLimitMiddleware(
  options: {
    maxRequests?: number;
    windowMs?: number;
    keyGenerator?: (event: IpcMainInvokeEvent) => string;
  } = {}
): IMiddleware {
  const {
    maxRequests = 100,
    windowMs = 60000, // 1分钟
    keyGenerator = (event) => `webContents:${event.sender.id}`,
  } = options;

  const records = new Map<string, RateLimitRecord>();

  const cleanupExpiredRecords = (
    recordsMap: Map<string, RateLimitRecord>,
    currentTime: number
  ) => {
    for (const [key, record] of recordsMap.entries()) {
      if (currentTime > record.resetTime) {
        recordsMap.delete(key);
      }
    }
  };

  return async (
    event: IpcMainInvokeEvent,
    next: () => Promise<any>,
    ...args: any[]
  ) => {
    const key = keyGenerator(event);
    const now = Date.now();

    // 获取或创建记录
    let record = records.get(key);
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      records.set(key, record);
    }

    // 检查是否超过限制
    if (record.count >= maxRequests) {
      const remainingTime = Math.ceil((record.resetTime - now) / 1000);
      throw new Error(`请求频率过高，请在 ${remainingTime} 秒后重试`);
    }

    // 增加计数
    record.count++;

    // 清理过期记录
    cleanupExpiredRecords(records, now);

    return await next();
  };
}
