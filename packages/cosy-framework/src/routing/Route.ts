/**
 * 路由类
 * 提供链式API来配置路由，类似Laravel的Route门面
 */

import { IMiddleware } from '../contract/IMiddleware.js';
import { IRouteConfig } from '../contract/router/IRouteConfig.js';
import { IRouteHandler } from '../contract/router/IRouteHandler.js';
import { IValidationRules } from '../contract/router/IValidation.js';
import { Router } from './Router.js';

export class Route {
  private config: IRouteConfig;
  private router: Router;

  constructor(
    router: Router,
    config: { channel: string; handler: IRouteHandler }
  ) {
    this.router = router;
    this.config = {
      ...config,
      middleware: [],
    };
  }

  /**
   * 添加中间件
   */
  middleware(...middleware: IMiddleware[]): this {
    this.config.middleware = [...(this.config.middleware || []), ...middleware];
    return this;
  }

  /**
   * 设置参数验证规则
   */
  validation(rules: IValidationRules): this {
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
   * 设置路由前缀
   */
  prefix(prefix: string): this {
    this.config.channel = `${prefix}:${this.config.channel}`;
    return this;
  }

  /**
   * 设置路由名称
   */
  name(name: string): this {
    // This could be used for URL generation in the future
    // For now, we can store it in the description or a new property
    this.config.description = this.config.description
      ? `${this.config.description} (Name: ${name})`
      : `(Name: ${name})`;
    return this;
  }

  /**
   * 获取路由配置
   */
  getConfig(): IRouteConfig {
    return this.config;
  }

  /**
   * 获取路由通道
   */
  getChannel(): string {
    return this.config.channel;
  }

  /**
   * 静态方法：创建新路由
   */
  static handle(channel: string, handler: IRouteHandler): Route {
    console.log('🌿 创建新路由', channel);
    return new Route(new Router(), { channel, handler });
  }

  /**
   * 静态方法：创建GET类型的路由（用于查询操作）
   */
  static get(channel: string, handler: IRouteHandler): Route {
    return new Route(new Router(), { channel, handler });
  }

  /**
   * 静态方法：创建POST类型的路由（用于创建操作）
   */
  static post(channel: string, handler: IRouteHandler): Route {
    return new Route(new Router(), { channel, handler });
  }

  /**
   * 静态方法：创建PUT类型的路由（用于更新操作）
   */
  static put(channel: string, handler: IRouteHandler): Route {
    return new Route(new Router(), { channel, handler });
  }

  /**
   * 静态方法：创建DELETE类型的路由（用于删除操作）
   */
  static delete(channel: string, handler: IRouteHandler): Route {
    return new Route(new Router(), { channel, handler });
  }
}
