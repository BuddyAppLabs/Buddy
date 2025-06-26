/**
* 路由服务提供者
* 负责注册和初始化路由系统
*/
import { ServiceProvider } from '@coffic/cosy';
import { router } from './index.js';
import { RouteConfig, RouteGroup } from './types.js';

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
        console.log('✅ 路由服务启动完成');
    }

    /**
     * 输出已注册的路由信息
     */
    public printRegisteredRoutes(): void {
        const routes = router.getRoutes();
        const groups = router.getGroups();

        console.log('\n📍 已注册的路由:');
        console.log('----------------------------------------');

        // 按分组组织路由
        const routesByGroup = new Map<string, RouteConfig[]>();

        // 初始化未分组路由
        routesByGroup.set('ungrouped', []);

        // 初始化所有分组
        groups.forEach((group: RouteGroup) => {
            routesByGroup.set(group.name, []);
        });

        // 将路由分配到对应的分组
        routes.forEach((route: RouteConfig) => {
            const groupName = route.group || 'ungrouped';
            const groupRoutes = routesByGroup.get(groupName) || [];
            groupRoutes.push(route);
            routesByGroup.set(groupName, groupRoutes);
        });

        // 输出路由信息
        routesByGroup.forEach((groupRoutes: RouteConfig[], groupName: string) => {
            if (groupRoutes.length === 0) return;

            if (groupName !== 'ungrouped') {
                const group = groups.get(groupName);
                console.log(`\n📦 分组: ${groupName}`);
                if (group?.prefix) console.log(`   前缀: ${group.prefix}`);
                if (group?.description) console.log(`   描述: ${group.description}`);
                console.log('----------------------------------------');
            } else if (groupRoutes.length > 0) {
                console.log('\n🔷 未分组路由:');
                console.log('----------------------------------------');
            }

            groupRoutes.forEach((route: RouteConfig) => {
                console.log(`   ${route.channel}`);
                if (route.description) console.log(`   描述: ${route.description}`);
                if (route.middleware?.length) console.log(`   中间件: ${route.middleware.length} 个`);
                console.log('----------------------------------------');
            });
        });

        console.log(`\n共计 ${routes.size} 个路由\n`);
    }

    /**
     * 获取提供的服务
     */
    public provides(): string[] {
        return ['router', 'Route'];
    }
}