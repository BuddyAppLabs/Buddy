/**
 * 路由服务契约
 * 定义路由服务所提供的核心功能
 */

import { Route } from '../Route.js';
import { RouteHandler, Middleware } from '../types.js';
import { ContractRouteRegistrar } from './ContractRouteRegistrar.js';
import { RouteConfig, RouteGroup } from '../types.js';

export interface ContractRouter {
    /**
     * 注册 GET 类型的路由
     */
    get(channel: string, handler: RouteHandler): Route;

    /**
     * 注册 POST 类型的路由
     */
    post(channel: string, handler: RouteHandler): Route;

    /**
     * 注册 PUT 类型的路由
     */
    put(channel: string, handler: RouteHandler): Route;

    /**
     * 注册 DELETE 类型的路由
     */
    delete(channel: string, handler: RouteHandler): Route;

    /**
     * 通用路由注册方法
     */
    handle(channel: string, handler: RouteHandler): Route;

    /**
     * 创建路由分组
     */
    group(config: {
        prefix?: string;
        middleware?: Middleware[];
        name?: string;
        description?: string;
    }, callback: () => void): void;

    /**
     * 添加中间件到路由
     */
    middleware(...middleware: Middleware[]): ContractRouteRegistrar;

    /**
     * 设置路由前缀
     */
    prefix(prefix: string): ContractRouteRegistrar;

    /**
     * 设置路由名称
     */
    name(name: string): ContractRouteRegistrar;

    /**
     * 获取所有注册的路由配置
     * 返回一个Map，key为路由通道名称，value为路由配置
     */
    getRoutes(): Map<string, RouteConfig>;

    /**
     * 获取所有路由分组配置
     * 返回一个Map，key为分组名称，value为分组配置
     */
    getGroups(): Map<string, RouteGroup>;

    /**
     * 获取格式化的路由列表
     * 返回一个包含所有路由信息的字符串数组，每个元素包含路由的通道、描述等信息
     */
    listRoutes(): string[];

    /**
     * 初始化路由系统
     * 将所有注册的路由绑定到Electron的ipcMain
     */
    initialize(): void;

    /**
     * 清空所有路由（用于测试）
     */
    clear(): void;
} 