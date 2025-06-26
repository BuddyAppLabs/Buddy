/**
 * 路由系统类型定义
 * 提供IPC路由的类型安全和结构化定义
 */

import { IpcMainInvokeEvent } from 'electron';

/**
 * 路由处理器函数类型
 */
export type RouteHandler = (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any> | any;

/**
 * 中间件函数类型
 */
export type Middleware = (request: any, next: () => Promise<any>) => Promise<any>;

/**
 * 验证规则类型
 */
export interface ValidationRules {
    [param: string]: {
        required?: boolean;
        type?: string;
        validator?: (value: any) => boolean | string;
    };
}

/**
 * 路由配置类型
 */
export interface RouteConfig {
    channel: string;
    handler: RouteHandler;
    middleware: Middleware[];
    validation: ValidationRules;
    name?: string;
    description?: string;
    type?: 'get' | 'post' | 'put' | 'delete' | 'handle';
}

/**
 * 路由分组配置
 */
export interface RouteGroup {
    /** 分组名称 */
    name: string;
    /** 分组前缀 */
    prefix?: string;
    /** 分组中间件 */
    middleware?: Middleware[];
    /** 分组描述 */
    description?: string;
}

/**
 * 路由匹配结果
 */
export interface RouteMatch {
    route: RouteConfig;
    params: Record<string, any>;
}

/**
 * 路由注册器接口
 */
export interface ContractRouteRegistrar {
    middleware(...middleware: Middleware[]): this;
    prefix(prefix: string): this;
    name(name: string): this;
    get(channel: string, handler: RouteHandler): any;
    post(channel: string, handler: RouteHandler): any;
    handle(channel: string, handler: RouteHandler): any;
    group(config: { name?: string; description?: string; }, callback: () => void): void;
}

/**
 * 路由器接口
 */
export interface ContractRouter {
    register(route: any): void;
    group(config: RouteGroup, callback: () => void): void;
    prefix(prefix: string): ContractRouteRegistrar;
    handle(channel: string, handler: RouteHandler): any;
    get(channel: string, handler: RouteHandler): any;
    post(channel: string, handler: RouteHandler): any;
    getRoutes(): Map<string, RouteConfig>;
    dispatch(channel: string, ...args: any[]): Promise<any>;
}