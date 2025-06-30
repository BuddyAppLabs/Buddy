/**
 * 关于 'electron' 模块导入的注意事项:
 * 本模块为 ESM, 而 'electron' 是 CJS 模块。直接使用 `import { ipcMain } from 'electron'` 会因模块系统不兼容而出错。
 * 必须使用 `import electron from 'electron'` 或 `import { default as electron } from 'electron'`
 * 之后再解构 `const { ipcMain } = electron` 来获取 `ipcMain`。
 */

import { default as electron, IpcMainInvokeEvent } from 'electron';
import { IMiddleware } from '../contract/IMiddleware.js';
import { IRouteConfig } from '../contract/router/IRouteConfig.js';
import { IRouteGroup } from '../contract/router/IRouteGroup.js';
import { IRouteHandler } from '../contract/router/IRouteHandler.js';
import { IRouteRegistrar } from '../contract/router/IRouteRegistrar.js';
import { IRouter } from '../contract/router/IRouter.js';
import { Route } from './Route.js';
import { Validator } from './Validator.js';
import { RouteRegistrar } from './RouteRegistar.js';

const { ipcMain } = electron;

export class Router implements IRouter {
  private routes: Map<string, IRouteConfig> = new Map();
  private groups: Map<string, IRouteGroup> = new Map();
  private globalMiddleware: IMiddleware[] = [];
  private validator: Validator;

  constructor() {
    this.validator = new Validator();
  }

  /**
   * 注册 GET 类型的路由
   */
  get(channel: string, handler: IRouteHandler): Route {
    return this.handle(channel, handler);
  }

  /**
   * 注册 POST 类型的路由
   */
  post(channel: string, handler: IRouteHandler): Route {
    return this.handle(channel, handler);
  }

  /**
   * 注册 PUT 类型的路由
   */
  put(channel: string, handler: IRouteHandler): Route {
    return this.handle(channel, handler);
  }

  /**
   * 注册 DELETE 类型的路由
   */
  delete(channel: string, handler: IRouteHandler): Route {
    return this.handle(channel, handler);
  }

  /**
   * 通用路由注册方法
   */
  handle(channel: string, handler: IRouteHandler): Route {
    const route = new Route(this, { channel, handler });
    this.register(route.getConfig());
    return route;
  }

  /**
   * 创建路由分组
   */
  group(
    config: string | Omit<IRouteGroup, 'name'>,
    callback: (registrar: IRouteRegistrar) => void
  ): void {
    const registrar = new RouteRegistrar(this);
    if (typeof config === 'string') {
      registrar.prefix(config);
    } else {
      if (config.prefix) registrar.prefix(config.prefix);
      if (config.middleware) registrar.middleware(...config.middleware);
    }
    callback(registrar);
  }

  /**
   * 添加中间件到路由
   */
  middleware(...middleware: IMiddleware[]): this {
    this.globalMiddleware.push(...middleware);
    return this;
  }

  /**
   * 设置路由前缀
   */
  prefix(prefix: string): this {
    // 这应该由 RouteRegistrar 处理
    console.warn(`[Router] prefix() should be used within a group.`);
    return this;
  }

  /**
   * 设置路由名称
   */
  name(name: string): this {
    // 这应该由 RouteRegistrar 处理
    console.warn(`[Router] name() should be used within a group.`);
    return this;
  }

  /**
   * 注册路由
   */
  register(route: IRouteConfig): void {
    if (this.routes.has(route.channel)) {
      throw new Error(
        `[Router] Route [${route.channel}] has already been registered.`
      );
    }
    this.routes.set(route.channel, route);
  }

  /**
   * 添加全局中间件
   */
  use(middleware: IMiddleware): void {
    this.globalMiddleware.push(middleware);
  }

  /**
   * 获取所有路由
   */
  getRoutes(): IRouteConfig[] {
    return Array.from(this.routes.values());
  }

  /**
   * 获取路由分组
   */
  getRouteGroups(): IRouteGroup[] {
    return Array.from(this.groups.values());
  }

  /**
   * 获取格式化的路由列表
   */
  listRoutes(): string[] {
    const routes: string[] = [];
    this.routes.forEach((config, channel) => {
      const group = config.group ? this.groups.get(config.group) : undefined;
      const description = config.description || '无描述';
      const groupInfo = group ? ` (分组: ${config.group})` : '';
      routes.push(`${channel} - ${description}${groupInfo}`);
    });
    return routes;
  }

  /**
   * 初始化路由系统
   */
  initialize(): void {
    this.routes.forEach((config, channel) => {
      ipcMain.handle(
        channel,
        async (event: IpcMainInvokeEvent, ...args: any[]) => {
          // 验证参数
          if (config.validation) {
            const validationResult = this.validator.validate(
              args,
              config.validation
            );
            if (!validationResult.valid) {
              return {
                success: false,
                error: validationResult.errors.join(', '),
              };
            }
          }

          try {
            // 执行中间件链
            let result = await config.handler(event, ...args);
            return {
              success: true,
              data: result,
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : '未知错误',
            };
          }
        }
      );
    });
  }

  /**
   * 分发请求
   */
  async dispatch(
    channel: string,
    args: any[],
    event: IpcMainInvokeEvent
  ): Promise<any> {
    const match = this.findRoute(channel);
    if (!match) {
      throw new Error(`[Router] Route [${channel}] not found`);
    }

    const { route } = match;

    // 合并全局和路由特定的中间件
    const middlewareChain = [
      ...this.globalMiddleware,
      ...(route.middleware || []),
    ];

    const finalHandler = (evt: IpcMainInvokeEvent, ...a: any[]) =>
      route.handler(evt, ...a);

    const chain = middlewareChain.reduceRight(
      (next, middleware) =>
        (evt, ...a) =>
          middleware(evt, () => next(evt, ...a), channel, ...a),
      finalHandler
    );

    const result = await chain(event, ...args);

    return result;
  }

  /**
   * 清空所有路由（用于测试）
   */
  clear(): void {
    this.routes.clear();
    this.groups.clear();
    this.globalMiddleware = [];
  }

  findRoute(
    channel: string
  ): { route: IRouteConfig; params: { [key: string]: string } } | null {
    // 基本匹配，可以扩展以支持路由参数
    if (this.routes.has(channel)) {
      return { route: this.routes.get(channel)!, params: {} };
    }
    return null;
  }
}
