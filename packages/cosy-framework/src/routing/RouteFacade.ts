/**
 * Route 门面
 * 为路由服务提供优雅的静态访问接口
 *
 * 该门面:
 * 1. 继承自基础门面类
 * 2. 通过 'router' 标识符访问路由服务
 * 3. 代理访问由 RouteServiceProvider 注册的路由实例
 * 4. 提供完整的 TypeScript 类型提示
 *
 * 使用示例:
 * ```typescript
 * RouteFacade.get('api/users', handler);
 * RouteFacade.group({ prefix: 'api' }, () => {
 *   // 路由定义
 * });
 * ```
 */

import { IRouter } from '../contract/router/IRouter.js';
import { createFacade } from '../facades/createFacade.js';
import { Facade } from '../facades/Facade.js';

/**
 * 路由门面基类
 */
class BaseFacade extends Facade {
  protected static override getFacadeAccessor(): string {
    return 'router';
  }
}

// 创建并导出类型安全的路由门面
export const RouteFacade = createFacade<IRouter>(BaseFacade);
