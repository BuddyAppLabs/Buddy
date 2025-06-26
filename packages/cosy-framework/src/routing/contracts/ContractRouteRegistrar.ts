/**
 * 路由注册器契约
 * 定义路由注册器的链式调用方法
 */

import { Route } from '../Route.js';
import { RouteHandler, Middleware } from '../types.js';

export interface ContractRouteRegistrar {
    /**
     * 添加中间件
     */
    middleware(...middleware: Middleware[]): this;

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
    get(channel: string, handler: RouteHandler): Route;

    /**
     * 注册 POST 路由
     */
    post(channel: string, handler: RouteHandler): Route;

    /**
     * 注册 PUT 路由
     */
    put(channel: string, handler: RouteHandler): Route;

    /**
     * 注册 DELETE 路由
     */
    delete(channel: string, handler: RouteHandler): Route;

    /**
     * 注册通用路由
     */
    handle(channel: string, handler: RouteHandler): Route;

    /**
     * 创建路由分组
     */
    group(config: {
        name?: string;
        description?: string;
    }, callback: () => void): void;
} 