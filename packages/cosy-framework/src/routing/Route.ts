/**
 * 路由类
 * 提供链式API来配置路由，类似Laravel的Route门面
 */

import { RouteConfig, RouteHandler, Middleware, ValidationRules } from './types.js';

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
     * 创建GET类型路由
     */
    static get(channel: string, handler: RouteHandler): Route {
        const route = new Route(channel, handler);
        route.config.type = 'get';
        return route;
    }

    /**
     * 创建POST类型路由
     */
    static post(channel: string, handler: RouteHandler): Route {
        const route = new Route(channel, handler);
        route.config.type = 'post';
        return route;
    }

    /**
     * 创建通用路由
     */
    static handle(channel: string, handler: RouteHandler): Route {
        const route = new Route(channel, handler);
        route.config.type = 'handle';
        return route;
    }

    /**
     * 添加中间件
     */
    middleware(...middleware: Middleware[]): this {
        this.config.middleware = [...(this.config.middleware || []), ...middleware];
        return this;
    }

    /**
     * 添加验证规则
     */
    validation(rules: ValidationRules): this {
        this.config.validation = rules;
        return this;
    }

    /**
     * 设置路由名称
     */
    name(name: string): this {
        this.config.name = name;
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
     * 获取路由配置
     */
    getConfig(): RouteConfig {
        return this.config as RouteConfig;
    }
}