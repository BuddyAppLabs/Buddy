/**
 * 路由器类
 * 提供路由注册和分发功能
 */

import { ContractRouter, ContractRouteRegistrar, RouteConfig, RouteGroup, RouteHandler, Middleware } from './types.js';
import { Route } from './Route.js';
import { Validator } from './Validator.js';
import { EMOJI } from '../constants.js';

class RouteRegistrar implements ContractRouteRegistrar {
    private _prefix: string = '';
    private _middleware: Middleware[] = [];
    private _name: string = '';

    constructor(private router: Router) { }

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

    get(channel: string, handler: RouteHandler): Route {
        return this.router.get(this._prefix ? `${this._prefix}:${channel}` : channel, handler);
    }

    post(channel: string, handler: RouteHandler): Route {
        return this.router.post(this._prefix ? `${this._prefix}:${channel}` : channel, handler);
    }

    handle(channel: string, handler: RouteHandler): Route {
        return this.router.handle(this._prefix ? `${this._prefix}:${channel}` : channel, handler);
    }

    group(config: { name: string; description?: string; }, callback: () => void): void {
        this.router.group({
            ...config,
            prefix: this._prefix,
            middleware: this._middleware
        }, callback);
    }
}

export class Router implements ContractRouter {
    private static _instance: Router;
    private routes: Map<string, RouteConfig> = new Map();
    private groups: Map<string, RouteGroup> = new Map();
    private globalMiddleware: Middleware[] = [];
    private validator: Validator;

    private constructor() {
        this.validator = new Validator();
    }

    public static getInstance(): Router {
        if (!Router._instance) {
            Router._instance = new Router();
        }
        return Router._instance;
    }

    /**
     * 注册全局中间件
     */
    use(middleware: Middleware): this {
        this.globalMiddleware.push(middleware);
        return this;
    }

    /**
     * 注册路由
     */
    register(route: Route): void {
        const config = route.getConfig();
        this.routes.set(config.channel, {
            ...config,
            middleware: [...this.globalMiddleware, ...(config.middleware || [])]
        });
    }

    /**
     * 创建路由组
     */
    group(config: RouteGroup, callback: () => void): void {
        const currentMiddleware = [...this.globalMiddleware];
        if (config.middleware) {
            this.globalMiddleware.push(...config.middleware);
        }

        callback();

        this.globalMiddleware = currentMiddleware;
        if (config.name) {
            this.groups.set(config.name, config);
        }
    }

    /**
     * 设置路由前缀
     */
    prefix(prefix: string): ContractRouteRegistrar {
        const registrar = new RouteRegistrar(this);
        registrar.prefix(prefix);
        return registrar;
    }

    /**
     * 通用路由注册方法
     */
    handle(channel: string, handler: RouteHandler): Route {
        const route = new Route(channel, handler);
        this.register(route);
        return route;
    }

    /**
     * 注册GET类型路由
     */
    get(channel: string, handler: RouteHandler): Route {
        const route = Route.get(channel, handler);
        this.register(route);
        return route;
    }

    /**
     * 注册POST类型路由
     */
    post(channel: string, handler: RouteHandler): Route {
        const route = Route.post(channel, handler);
        this.register(route);
        return route;
    }

    /**
     * 批量注册路由
     */
    registerRoutes(routes: Route[]): void {
        routes.forEach(route => this.register(route));
    }

    /**
     * 获取所有路由
     */
    getRoutes(): Map<string, RouteConfig> {
        return new Map(this.routes);
    }

    /**
     * 分发请求
     */
    async dispatch(channel: string, ...args: any[]): Promise<any> {
        const route = this.routes.get(channel);
        if (!route) {
            // 将所有路由打印出来
            console.log(`${EMOJI} [Router] 所有路由: \n ${JSON.stringify(this.routes, null, 2)} \n`);

            throw new Error(`[Router] Route [${channel}] not found`);
        }

        // 验证参数
        if (Object.keys(route.validation).length > 0) {
            const validation = this.validator.validate(args, route.validation);
            if (!validation.valid) {
                throw new Error(`${EMOJI} ${validation.error}`);
            }
        }

        // 构建中间件链
        const middlewareChain = [...route.middleware];
        let index = 0;

        const next = async (): Promise<any> => {
            if (index < middlewareChain.length) {
                const middleware = middlewareChain[index++];
                return middleware({ channel, args }, next);
            }
            return route.handler(args[0], ...args.slice(1));
        };

        return next();
    }
}