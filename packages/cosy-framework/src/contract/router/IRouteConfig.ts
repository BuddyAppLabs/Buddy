import { IMiddleware } from '../IMiddleware';
import { IRouteHandler } from './IRouteHandler';
import { IValidationRules } from './IValidation';

/**
 * 路由配置接口
 */
export interface IRouteConfig {
  /** 路由通道名称 */
  channel: string;
  /** 路由处理器 */
  handler: IRouteHandler;
  /** 中间件列表 */
  middleware?: IMiddleware[];
  /** 参数验证规则 */
  validation?: IValidationRules;
  /** 路由描述 */
  description?: string;
  /** 路由分组 */
  group?: string;
}
