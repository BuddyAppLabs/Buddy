/**
* 路由服务提供者
* 负责注册和初始化路由系统
*/
import { ServiceProvider } from '@coffic/cosy';
import { router } from './index.js';

export class RouteServiceProvider extends ServiceProvider {
    /**
     * 注册路由服务
     */
    public register(): void {
        // 注册路由实例到容器
        this.app.container().singleton('router', () => {
            return router;
        });

        // 注册路由门面的别名
        this.app.container().alias('Route', 'router');
    }

    /**
     * 启动路由服务
     */
    public async boot(): Promise<void> {
        // 在这里可以注册全局中间件
        // router.use(...);

        // 加载路由配置
        await this.loadRoutes();
    }

    /**
     * 加载路由配置
     * 这个方法可以被子类重写以自定义路由加载逻辑
     */
    protected async loadRoutes(): Promise<void> {
        // 默认实现为空，应用可以通过继承此类来实现自己的路由加载逻辑
    }

    /**
     * 获取提供的服务
     */
    public provides(): string[] {
        return ['router', 'Route'];
    }
}