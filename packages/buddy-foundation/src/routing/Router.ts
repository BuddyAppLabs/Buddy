/**
 * 路由器类
 * 负责管理路由集合、分组和路由注册，类似Laravel的Router
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { RouteConfig, RouteGroup, Middleware, RouteHandler } from './types.js';
import { Route } from './Route.js';
import { Validator } from './Validator.js';

export class Router {
    private routes: Map<string, RouteConfig> = new Map();
    private groups: Map<string, RouteGroup> = new Map();
    private globalMiddleware: Middleware[] = [];
    private validator: Validator;

    constructor() {
        this.validator = new Validator();
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
     * 创建路由分组
     */
    group(config: RouteGroup, callback: (router: Router) => void): void {
        this.groups.set(config.name, config);

        // 在分组上下文中执行回调
        const groupRouter = new Router();
        groupRouter.groups = this.groups;
        groupRouter.globalMiddleware = this.globalMiddleware;

        callback(groupRouter);

        // 将分组路由添加到主路由器
        groupRouter.routes.forEach((routeConfig, channel) => {
            routeConfig.group = config.name;
            this.routes.set(channel, routeConfig);
        });
    }

    /**
     * 添加全局中间件
     */
    middleware(middleware: Middleware): void {
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
     * 初始化IPC路由
     * 将所有注册的路由绑定到Electron的ipcMain
     */
    initialize(): void {
        for (const [channel, config] of this.routes) {
            const wrappedHandler = this.createWrappedHandler(config);
            ipcMain.handle(channel, wrappedHandler);
        }
    }

    /**
     * 创建包装的处理器，支持中间件和验证
     */
    private createWrappedHandler(config: RouteConfig) {
        return async (event: IpcMainInvokeEvent, ...args: any[]) => {
            try {
                // 参数验证
                if (config.validation) {
                    const validationResult = this.validator.validate(args, config.validation);
                    if (!validationResult.valid) {
                        throw new Error(`参数验证失败: ${validationResult.errors.join(', ')}`);
                    }
                }

                // 执行中间件链
                if (config.middleware && config.middleware.length > 0) {
                    return await this.executeMiddleware(config.middleware, event, config.handler, ...args);
                }

                // 直接执行处理器
                return await config.handler(event, ...args);
            } catch (error) {
                console.error(`路由 ${config.channel} 执行错误:`, error);
                throw error;
            }
        };
    }

    /**
     * 执行中间件链
     */
    private async executeMiddleware(
        middleware: Middleware[],
        event: IpcMainInvokeEvent,
        finalHandler: RouteHandler,
        ...args: any[]
    ): Promise<any> {
        let index = 0;

        const next = async (): Promise<any> => {
            if (index >= middleware.length) {
                return await finalHandler(event, ...args);
            }

            const currentMiddleware = middleware[index++];
            return await currentMiddleware(event, next, ...args);
        };

        return await next();
    }

    /**
     * 便捷方法：处理任意通道
     */
    handle(channel: string, handler: RouteHandler): Route {
        return Route.handle(channel, handler);
    }

    /**
     * 便捷方法：GET路由
     */
    get(channel: string, handler: RouteHandler): Route {
        return Route.get(channel, handler);
    }

    /**
     * 便捷方法：POST路由
     */
    post(channel: string, handler: RouteHandler): Route {
        return Route.post(channel, handler);
    }

    /**
     * 便捷方法：PUT路由
     */
    put(channel: string, handler: RouteHandler): Route {
        return Route.put(channel, handler);
    }

    /**
     * 便捷方法：DELETE路由
     */
    delete(channel: string, handler: RouteHandler): Route {
        return Route.delete(channel, handler);
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