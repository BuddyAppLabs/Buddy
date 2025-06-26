/**
 * 路由服务提供者
 * 负责注册和初始化路由系统
 */

import { ServiceProvider } from '../providers/ServiceProvider.js';
import { Router } from './Router.js';

export class RouteServiceProvider extends ServiceProvider {
    /**
     * 注册路由服务
     */
    public register(): void {
        // 注册路由实例到容器
        this.app.container().singleton('router', () => {
            return Router.getInstance();
        });

        // 注册路由门面的别名
        this.app.container().alias('Route', 'router');
    }

    /**
     * 启动路由服务
     */
    public override async boot(): Promise<void> {
        console.log('🚀 [RouteServiceProvider] 路由服务启动完成');
    }

    /**
     * 获取提供的服务
     */
    public override provides(): string[] {
        return ['router', 'Route'];
    }
}