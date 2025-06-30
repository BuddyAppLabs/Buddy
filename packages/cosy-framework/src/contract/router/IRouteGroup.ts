import { IMiddleware } from '../IMiddleware';

/**
 * 路由分组配置
 */
export interface IRouteGroup {
  /** 分组名称 */
  name: string;
  /** 分组前缀 */
  prefix?: string;
  /** 分组中间件 */
  middleware?: IMiddleware[];
  /** 分组描述 */
  description?: string;
}
