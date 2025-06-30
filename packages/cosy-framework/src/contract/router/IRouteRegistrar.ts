/**
 * 路由注册器契约
 * 定义路由注册器的链式调用方法
 */

import { Route } from '../../routing/Route.js';
import { IRouteHandler } from './IRouteHandler.js';
import { IMiddleware } from '../IMiddleware.js';
import { IRouteConfig } from './IRouteConfig.js';
import { IRouteGroup } from './IRouteGroup.js';

export interface IRouteRegistrar {
  /**
   * 添加中间件
   */
  middleware(...middleware: IMiddleware[]): this;

  /**
   * 设置路由前缀
   */
  prefix(prefix: string): this;

  /**
   * 设置路由名称
   */
  name(name: string): this;

  /**
   * 注册 GET 路由
   */
  get(channel: string, handler: IRouteHandler): Route;

  /**
   * 注册 POST 路由
   */
  post(channel: string, handler: IRouteHandler): Route;

  /**
   * 注册 PUT 路由
   */
  put(channel: string, handler: IRouteHandler): Route;

  /**
   * 注册 DELETE 路由
   */
  delete(channel: string, handler: IRouteHandler): Route;

  /**
   * 注册通用路由
   */
  handle(channel: string, handler: IRouteHandler): Route;

  /**
   * 定义路由分组
   * @param prefix 分组前缀或分组配置
   * @param callback 路由定义回调
   */
  group(
    prefix: string | Omit<IRouteGroup, 'name'>,
    callback: (registrar: IRouteRegistrar) => void
  ): void;

  /**
   * 获取所有已注册的路由
   */
  getRoutes(): IRouteConfig[];

  /**
   * 获取所有已注册的路由组
   */
  getRouteGroups(): IRouteGroup[];
}
