/**
 * 路由服务提供者
 * 负责注册和初始化路由系统
 *
 * 该服务提供者:
 * 1. 注册全局路由实例到容器
 * 2. 提供 'router' 和 'Route' 两个服务标识符
 * 3. 确保路由实例为单例模式
 */
import { ServiceProvider } from '../setting/ServiceProvider.js';
import { Router } from './Router.js';
import { EMOJI, RouterAbstract, RouterAlias } from '../constants.js';

export class RouteServiceProvider extends ServiceProvider {
  /**
   * 注册路由服务
   *
   * 在这里我们:
   * 1. 将路由实例注册为单例
   * 2. 注册 'Route' 作为 'router' 的别名
   */
  public register(): void {
    // 注册路由实例到容器
    this.app.container().singleton(RouterAbstract, () => {
      return new Router();
    });

    // 注册路由门面的别名
    RouterAlias.forEach((alias) => {
      this.app.container().alias(alias, RouterAbstract);
    });
  }

  /**
   * 启动路由服务
   * 在这里可以执行一些路由服务启动时需要的初始化操作
   */
  public override async boot(): Promise<void> {
    if (this.app.config().debug) {
      console.log(`${EMOJI} [RouteServiceProvider] 路由服务启动完成`);
    }
  }

  /**
   * 获取提供的服务
   * 声明该服务提供者提供的所有服务标识符
   */
  public override provides(): string[] {
    return ['router', 'Route'];
  }
}
