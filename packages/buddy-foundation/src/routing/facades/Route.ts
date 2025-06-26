/**
 * Route 门面
 * 提供类似 Laravel Route 门面的静态方法
 * 让路由注册更加优雅和直观
 */

import { router } from '../index.js';
import { Route as RouteClass } from '../Route.js';
import { RouteHandler, Middleware, ValidationRules } from '../types.js';

export class Route {
    /**
     * 注册 GET 类型的路由（语义化，实际上都是 IPC handle）
     */
    static get(channel: string, handler: RouteHandler): RouteClass {
        const route = RouteClass.handle(channel, handler);
        router.register(route);
        return route;
    }

    /**
     * 注册 POST 类型的路由（语义化，实际上都是 IPC handle）
     */
    static post(channel: string, handler: RouteHandler): RouteClass {
        const route = RouteClass.handle(channel, handler);
        router.register(route);
        return route;
    }

    /**
     * 注册 PUT 类型的路由（语义化，实际上都是 IPC handle）
     */
    static put(channel: string, handler: RouteHandler): RouteClass {
        const route = RouteClass.handle(channel, handler);
        router.register(route);
        return route;
    }

    /**
     * 注册 DELETE 类型的路由（语义化，实际上都是 IPC handle）
     */
    static delete(channel: string, handler: RouteHandler): RouteClass {
        const route = RouteClass.handle(channel, handler);
        router.register(route);
        return route;
    }

    /**
     * 通用路由注册方法
     */
    static handle(channel: string, handler: RouteHandler): RouteClass {
        const route = RouteClass.handle(channel, handler);
        router.register(route);
        return route;
    }

    /**
     * 创建路由分组
     */
    static group(config: {
        prefix?: string;
        middleware?: Middleware[];
        name?: string;
        description?: string;
    }, callback: () => void): void {
        router.group({
            name: config.name || 'default',
            prefix: config.prefix,
            middleware: config.middleware,
            description: config.description
        }, () => {
            callback();
        });
    }

    /**
     * 添加中间件到路由
     */
    static middleware(...middleware: Middleware[]): RouteRegistrar {
        return new RouteRegistrar().middleware(...middleware);
    }

    /**
     * 设置路由前缀
     */
    static prefix(prefix: string): RouteRegistrar {
        return new RouteRegistrar().prefix(prefix);
    }

    /**
     * 设置路由名称
     */
    static name(name: string): RouteRegistrar {
        return new RouteRegistrar().name(name);
    }
}

/**
 * 路由注册器，支持链式调用
 */
class RouteRegistrar {
    private _middleware: Middleware[] = [];
    private _prefix: string = '';
    private _name: string = '';

    middleware(...middleware: Middleware[]): this {
        this._middleware.push(...middleware);
        return this;
    }

    prefix(prefix: string): this {
        this._prefix = prefix;
        return this;
    }

    name(name: string): this {
        this._name = name;
        return this;
    }

    get(channel: string, handler: RouteHandler): RouteClass {
        return this.createRoute(channel, handler);
    }

    post(channel: string, handler: RouteHandler): RouteClass {
        return this.createRoute(channel, handler);
    }

    put(channel: string, handler: RouteHandler): RouteClass {
        return this.createRoute(channel, handler);
    }

    delete(channel: string, handler: RouteHandler): RouteClass {
        return this.createRoute(channel, handler);
    }

    handle(channel: string, handler: RouteHandler): RouteClass {
        return this.createRoute(channel, handler);
    }

    group(config: {
        name?: string;
        description?: string;
    }, callback: () => void): void {
        router.group({
            name: config.name || this._name || 'default',
            prefix: this._prefix,
            middleware: this._middleware,
            description: config.description
        }, () => {
            callback();
        });
    }

    private createRoute(channel: string, handler: RouteHandler): RouteClass {
        const fullChannel = this._prefix ? `${this._prefix}:${channel}` : channel;
        const route = RouteClass.handle(fullChannel, handler);

        if (this._middleware.length > 0) {
            route.middleware(...this._middleware);
        }

        return route;
    }
} 