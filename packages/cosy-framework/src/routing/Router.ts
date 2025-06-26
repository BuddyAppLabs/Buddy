/**
 * 关于 'electron' 模块导入的注意事项:
 * 本模块为 ESM, 而 'electron' 是 CJS 模块。直接使用 `import { ipcMain } from 'electron'` 会因模块系统不兼容而出错。
 * 必须使用 `import electron from 'electron'` 或 `import { default as electron } from 'electron'`
 * 之后再解构 `const { ipcMain } = electron` 来获取 `ipcMain`。
 */

import { default as electron, IpcMainInvokeEvent } from 'electron';
const { ipcMain } = electron;
import { RouteConfig, RouteGroup, Middleware, RouteHandler } from './types.js';
import { Route } from './Route.js';
import { Validator } from './Validator.js';
import { ContractRouter } from './contracts/ContractRouter.js';
import { ContractRouteRegistrar } from './contracts/ContractRouteRegistrar.js';
import { EMOJI } from '../constants.js';

// 实现路由注册器
class RouteRegistrar implements ContractRouteRegistrar {
    private _middleware: Middleware[] = [];
    private _prefix: string = '';
    private _name: string = '';
    private router: Router;

    constructor(router: Router) {
        this.router = router;
    }

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

    put(channel: string, handler: RouteHandler): Route {
        return this.router.put(this._prefix ? `${this._prefix}:${channel}` : channel, handler);
    }

    delete(channel: string, handler: RouteHandler): Route {
        return this.router.delete(this._prefix ? `${this._prefix}:${channel}` : channel, handler);
    }

    handle(channel: string, handler: RouteHandler): Route {
        return this.router.handle(this._prefix ? `${this._prefix}:${channel}` : channel, handler);
    }

    group(config: { name?: string; description?: string; }, callback: () => void): void {
        this.router.group({
            ...config,
            prefix: this._prefix,
            middleware: this._middleware
        }, callback);
    }
}

export class Router implements ContractRouter {
    private routes: Map<string, RouteConfig> = new Map();
    private groups: Map<string, RouteGroup> = new Map();
    private globalMiddleware: Middleware[] = [];
    private validator: Validator;

    constructor() {
        this.validator = new Validator();
    }

    /**
     * 注册 GET 类型的路由
     */
    get(channel: string, handler: RouteHandler): Route {
        const route = new Route(channel, handler);
        this.register(route);
        return route;
    }

    /**
     * 注册 POST 类型的路由
     */
    post(channel: string, handler: RouteHandler): Route {
        const route = new Route(channel, handler);
        this.register(route);
        return route;
    }

    /**
     * 注册 PUT 类型的路由
     */
    put(channel: string, handler: RouteHandler): Route {
        const route = new Route(channel, handler);
        this.register(route);
        return route;
    }

    /**
     * 注册 DELETE 类型的路由
     */
    delete(channel: string, handler: RouteHandler): Route {
        const route = new Route(channel, handler);
        this.register(route);
        return route;
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
     * 创建路由分组
     */
    group(config: {
        prefix?: string;
        middleware?: Middleware[];
        name?: string;
        description?: string;
    }, callback: () => void): void {
        const groupName = config.name || `group_${Date.now()}`;
        this.groups.set(groupName, {
            name: groupName,
            prefix: config.prefix,
            middleware: config.middleware,
            description: config.description
        });

        callback();
    }

    /**
     * 添加中间件到路由
     */
    middleware(...middleware: Middleware[]): ContractRouteRegistrar {
        const registrar = new RouteRegistrar(this);
        registrar.middleware(...middleware);
        return registrar;
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
     * 设置路由名称
     */
    name(name: string): ContractRouteRegistrar {
        const registrar = new RouteRegistrar(this);
        registrar.name(name);
        return registrar;
    }

    /**
     * 注册路由
     */
    register(route: Route): void {
        const config = route.getConfig();

        // 应用分组配置
        if (config.group && this.groups.has(config.group)) {
            const group = this.groups.get(config.group)!;

            // 添加分组前缀
            if (group.prefix) {
                config.channel = `${group.prefix}:${config.channel}`;
            }

            // 合并分组中间件
            if (group.middleware) {
                config.middleware = [...group.middleware, ...(config.middleware || [])];
            }
        }

        // 添加全局中间件
        config.middleware = [...this.globalMiddleware, ...(config.middleware || [])];

        this.routes.set(config.channel, config);
    }

    /**
     * 批量注册路由
     */
    registerRoutes(routes: Route[]): void {
        routes.forEach(route => this.register(route));
    }

    /**
     * 添加全局中间件
     */
    use(middleware: Middleware): void {
        this.globalMiddleware.push(middleware);
    }

    /**
     * 获取所有路由
     */
    getRoutes(): Map<string, RouteConfig> {
        return new Map(this.routes);
    }

    /**
     * 获取路由分组
     */
    getGroups(): Map<string, RouteGroup> {
        return new Map(this.groups);
    }

    /**
     * 获取格式化的路由列表
     */
    listRoutes(): string[] {
        const routes: string[] = [];
        this.routes.forEach((config, channel) => {
            const group = config.group ? this.groups.get(config.group) : undefined;
            const description = config.description || 'No description';
            const groupInfo = group ? ` (Group: ${config.group})` : '';
            routes.push(`${channel} - ${description}${groupInfo}`);
        });
        return routes;
    }

    /**
     * 初始化路由系统
     */
    initialize(): void {
        this.routes.forEach((config, channel) => {
            ipcMain.handle(channel, async (event: IpcMainInvokeEvent, ...args: any[]) => {
                // 验证参数
                if (config.validation) {
                    const validationResult = this.validator.validate(args, config.validation);
                    if (!validationResult.valid) {
                        return {
                            success: false,
                            error: validationResult.errors.join(', ')
                        };
                    }
                }

                try {
                    // 执行中间件链
                    let result = await config.handler(event, ...args);
                    return {
                        success: true,
                        data: result
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            });
        });
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

        return route.handler(args[0], ...args.slice(1));
    }

    /**
     * 清空所有路由（用于测试）
     */
    clear(): void {
        this.routes.clear();
        this.groups.clear();
        this.globalMiddleware = [];
    }
}



