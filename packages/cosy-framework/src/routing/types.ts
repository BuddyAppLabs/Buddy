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
export type Middleware = (event: IpcMainInvokeEvent, next: () => Promise<any>, ...args: any[]) => Promise<any> | any;

/**
 * 路由参数验证规则
 */
export interface ValidationRule {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
    validator?: (value: any) => boolean | string;
}

/**
 * 路由参数验证配置
 */
export type ValidationRules = Record<string, ValidationRule>;

/**
 * 路由配置接口
 */
export interface RouteConfig {
    /** 路由通道名称 */
    channel: string;
    /** 路由处理器 */
    handler: RouteHandler;
    /** 中间件列表 */
    middleware?: Middleware[];
    /** 参数验证规则 */
    validation?: ValidationRules;
    /** 路由描述 */
    description?: string;
    /** 路由分组 */
    group?: string;
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