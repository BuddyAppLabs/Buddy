/**
 * 路由服务契约
 * 定义路由服务所提供的核心功能
 */

import { IpcMainInvokeEvent } from 'electron';
import { IRouteHandler } from './IRouteHandler.js';
import { IMiddleware } from '../IMiddleware.js';
import { IRouteConfig } from './IRouteConfig.js';
import { IRouteGroup } from './IRouteGroup.js';
import { IRouteRegistrar } from './IRouteRegistrar.js';

export interface IRouter extends IRouteRegistrar {
  /**
   * 应用中间件
   * @param middleware 要应用的中间件
   */
  use(middleware: IMiddleware): void;

  /**
   * 调度IPC请求到对应的路由处理器
   * @param channel 路由通道
   * @param args 请求参数
   */
  dispatch(
    channel: string,
    args: any[],
    event: IpcMainInvokeEvent
  ): Promise<any>;

  /**
   * 获取所有已注册的路由
   */
  getRoutes(): IRouteConfig[];

  /**
   * 获取所有已注册的路由组
   */
  getRouteGroups(): IRouteGroup[];

  /**
   * 查找匹配的路由
   * @param channel 路由通道
   */
  findRoute(
    channel: string
  ): { route: IRouteConfig; params: { [key: string]: string } } | null;
}
