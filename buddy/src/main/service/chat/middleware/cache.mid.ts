import type { LanguageModelV1Middleware } from 'ai';
import { ICacheRepo } from '../contract/ICacheRepo';

/**
 * 创建缓存中间件的工厂函数
 */
export function createCacheMiddleware(
  cacheRepo: ICacheRepo
): LanguageModelV1Middleware {
  return {
    wrapGenerate: async ({ doGenerate, params }) => {
      const cacheKey = JSON.stringify(params);

      // 检查缓存中是否存在
      if (await cacheRepo.has(cacheKey)) {
        const cachedResult = await cacheRepo.get(cacheKey);
        if (cachedResult) {
          return cachedResult;
        }
      }

      const result = await doGenerate();

      // 缓存结果，设置1小时过期时间
      await cacheRepo.set(cacheKey, result, 3600);

      return result;
    },

    wrapStream: async ({ doStream }) => {
      // 对于流式处理，暂时不实现缓存
      // 因为流式响应的特殊性，缓存流式内容会比较复杂
      return await doStream();
    },
  };
}
