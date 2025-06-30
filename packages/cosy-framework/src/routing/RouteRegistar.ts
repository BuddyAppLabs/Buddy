/**
 * 关于 'electron' 模块导入的注意事项:
 * 本模块为 ESM, 而 'electron' 是 CJS 模块。直接使用 `import { ipcMain } from 'electron'` 会因模块系统不兼容而出错。
 * 必须使用 `import electron from 'electron'` 或 `import { default as electron } from 'electron'`
 * 之后再解构 `const { ipcMain } = electron` 来获取 `ipcMain`。
 */

import { IMiddleware } from '../contract/IMiddleware.js';
import { IRouteConfig } from '../contract/router/IRouteConfig.js';
import { IRouteGroup } from '../contract/router/IRouteGroup.js';
import { IRouteHandler } from '../contract/router/IRouteHandler.js';
import { IRouteRegistrar } from '../contract/router/IRouteRegistrar.js';
import { Route } from './Route.js';
import { Router } from './Router.js';

export class RouteRegistrar implements IRouteRegistrar {
  private router: Router;
  private groupPrefix = '';
  private groupMiddleware: IMiddleware[] = [];

  constructor(
    router: Router,
    context?: { prefix?: string; middleware?: IMiddleware[] }
  ) {
    this.router = router;
    if (context) {
      this.groupPrefix = context.prefix || '';
      this.groupMiddleware = context.middleware || [];
    }
  }

  middleware(...middleware: IMiddleware[]): this {
    this.groupMiddleware.push(...middleware);
    return this;
  }

  prefix(prefix: string): this {
    this.groupPrefix = `${this.groupPrefix}${prefix}`;
    return this;
  }

  name(name: string): this {
    // Name is applied to a specific route, so this is a no-op on the registrar
    return this;
  }

  private applyGroupContext(route: Route): void {
    if (this.groupPrefix) {
      route.prefix(this.groupPrefix);
    }
    if (this.groupMiddleware.length > 0) {
      route.middleware(...this.groupMiddleware);
    }
  }

  get(channel: string, handler: IRouteHandler): Route {
    return this.handle(channel, handler);
  }

  post(channel: string, handler: IRouteHandler): Route {
    return this.handle(channel, handler);
  }

  put(channel: string, handler: IRouteHandler): Route {
    return this.handle(channel, handler);
  }

  delete(channel: string, handler: IRouteHandler): Route {
    return this.handle(channel, handler);
  }

  handle(channel: string, handler: IRouteHandler): Route {
    const route = new Route(this.router, { channel, handler });
    this.applyGroupContext(route);
    this.router.register(route.getConfig());
    return route;
  }

  group(
    config: string | Omit<IRouteGroup, 'name'>,
    callback: (registrar: IRouteRegistrar) => void
  ): void {
    this.router.group(config, callback);
  }

  getRoutes(): IRouteConfig[] {
    return this.router.getRoutes();
  }

  getRouteGroups(): IRouteGroup[] {
    return this.router.getRouteGroups();
  }
}
