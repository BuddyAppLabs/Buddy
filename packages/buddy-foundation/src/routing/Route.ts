/**
 * 路由类
 * 提供链式API来配置路由，类似Laravel的Route门面
 */

import { RouteConfig, RouteHandler, Middleware, ValidationRules } from './types';

export class Route {
    private config: Partial<RouteConfig>;

    constructor(channel: string, handler: RouteHandler) {
        this.config = {
            channel,
            handler,
            middleware: [],
            validation: {},
        };
    }

    /**
     * 添加中间件
     */
    middleware(...middleware: Middleware[]): this {
        this.config.middleware = [...(this.config.middleware || []), ...middleware];
        return this;
    }

    /**
     * 设置参数验证规则
     */
    validation(rules: ValidationRules): this {
        this.config.validation = { ...this.config.validation, ...rules };
        return this;
    }

    /**
     * 设置路由描述
     */
    description(description: string): this {
        this.config.description = description;
        return this;
    }

    /**
     * 设置路由分组
     */
    group(group: string): this {
        this.config.group = group;
        return this;
    }

    /**
     * 获取路由配置
     */
    getConfig(): RouteConfig {
        if (!this.config.channel || !this.config.handler) {
            throw new Error('路由配置不完整：缺少channel或handler');
        }
        return this.config as RouteConfig;
    }

    /**
     * 静态方法：创建新路由
     */
    static handle(channel: string, handler: RouteHandler): Route {
        console.log('🌿 创建新路由', channel, handler);
        return new Route(channel, handler);
    }

    /**
     * 静态方法：创建GET类型的路由（用于查询操作）
     */
    static get(channel: string, handler: RouteHandler): Route {
        return new Route(`get:${channel}`, handler);
    }

    /**
     * 静态方法：创建POST类型的路由（用于创建操作）
     */
    static post(channel: string, handler: RouteHandler): Route {
        return new Route(`post:${channel}`, handler);
    }

    /**
     * 静态方法：创建PUT类型的路由（用于更新操作）
     */
    static put(channel: string, handler: RouteHandler): Route {
        return new Route(`put:${channel}`, handler);
    }

    /**
     * 静态方法：创建DELETE类型的路由（用于删除操作）
     */
    static delete(channel: string, handler: RouteHandler): Route {
        return new Route(`delete:${channel}`, handler);
    }
} 