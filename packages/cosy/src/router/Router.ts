/**
 * IPC 路由器
 * 参考 Laravel Router 设计，专为 Electron IPC 通信优化
 */
import type { Middleware, IPCRequest, IPCResponse, NextFunction } from '../middleware/types.js';

export type ControllerMethod = (request: IPCRequest) => Promise<IPCResponse> | IPCResponse;

export interface RouteDefinition {
    channel: string;
    handler: ControllerMethod;
    middleware: Middleware[];
    name?: string;
}

export class Router {
    private static _instance: Router;
    private routes = new Map<string, RouteDefinition>();
    private namedRoutes = new Map<string, string>();
    private middleware: Middleware[] = [];

    private constructor() { }

    public static getInstance(): Router {
        if (!Router._instance) {
            Router._instance = new Router();
        }
        return Router._instance;
    }

    /**
     * 注册全局中间件
     * @param middleware 中间件实例
     */
    public use(middleware: Middleware): this {
        this.middleware.push(middleware);
        return this;
    }

    /**
     * 注册路由
     * @param channel IPC 通道名
     * @param handler 处理器函数
     * @param middleware 中间件数组
     */
    public register(
        channel: string,
        handler: ControllerMethod,
        middleware: Middleware[] = []
    ): RouteRegistrar {
        const route: RouteDefinition = {
            channel,
            handler,
            middleware: [...this.middleware, ...middleware],
        };

        this.routes.set(channel, route);
        return new RouteRegistrar(this, channel);
    }

    /**
     * 设置路由名称
     * @param channel IPC 通道名
     * @param name 路由名称
     */
    public name(channel: string, name: string): this {
        this.namedRoutes.set(name, channel);
        const route = this.routes.get(channel);
        if (route) {
            route.name = name;
        }
        return this;
    }

    /**
     * 通过名称获取通道
     * @param name 路由名称
     */
    public getByName(name: string): string | undefined {
        return this.namedRoutes.get(name);
    }

    /**
     * 获取路由定义
     * @param channel IPC 通道名
     */
    public getRoute(channel: string): RouteDefinition | undefined {
        return this.routes.get(channel);
    }

    /**
     * 获取所有路由
     */
    public getRoutes(): Map<string, RouteDefinition> {
        return new Map(this.routes);
    }

    /**
     * 处理 IPC 请求
     * @param channel IPC 通道名
     * @param args 请求参数
     */
    public async dispatch(channel: string, args: any[] = []): Promise<IPCResponse> {
        const route = this.routes.get(channel);
        if (!route) {
            return {
                success: false,
                error: `Route [${channel}] not found`,
            };
        }

        const request: IPCRequest = { channel, args };

        try {
            // 创建中间件管道
            const pipeline = this.createPipeline(route.middleware, route.handler);
            return await pipeline(request);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * 创建中间件管道
     * @param middleware 中间件数组
     * @param handler 最终处理器
     */
    private createPipeline(
        middleware: Middleware[],
        handler: ControllerMethod
    ): (request: IPCRequest) => Promise<IPCResponse> {
        return async (request: IPCRequest) => {
            let index = 0;

            const next: NextFunction = async (): Promise<IPCResponse> => {
                if (index < middleware.length) {
                    const currentMiddleware = middleware[index++];
                    return await currentMiddleware.handle(request, next);
                }
                return await handler(request);
            };

            return await next();
        };
    }

    /**
     * 批量注册路由
     * @param routes 路由数组
     */
    public registerRoutes(routes: Array<{
        channel: string;
        handler: ControllerMethod;
        middleware?: Middleware[];
        name?: string;
    }>): this {
        routes.forEach(route => {
            const registrar = this.register(route.channel, route.handler, route.middleware);
            if (route.name) {
                registrar.name(route.name);
            }
        });
        return this;
    }
}

/**
 * 路由注册器 - 用于链式调用
 */
class RouteRegistrar {
    constructor(
        private router: Router,
        private channel: string
    ) { }

    /**
     * 设置路由名称
     * @param name 路由名称
     */
    public name(name: string): RouteRegistrar {
        this.router.name(this.channel, name);
        return this;
    }
}

// 导出全局路由实例
export const router = Router.getInstance(); 