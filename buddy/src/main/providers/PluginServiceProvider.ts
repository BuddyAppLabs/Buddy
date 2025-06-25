/**
 * 插件服务提供者
 * 负责注册插件相关的服务
 */
import { ServiceProvider } from '@coffic/cosy';
import { pluginManager } from '../managers/PluginManager.js';

export class PluginServiceProvider extends ServiceProvider {
    public register(): void {
        console.log('🚀 PluginServiceProvider register');

        // 注册插件管理器实例
        this.app.container().instance('plugin.manager', pluginManager);

        // 设置别名
        this.app.container().alias('PluginManager', 'plugin.manager');
    }

    public async boot(): Promise<void> {
        const manager = this.app.make<any>('plugin.manager');
        // 如果有初始化方法的话
        if (typeof manager.initialize === 'function') {
            await manager.initialize();
        }
    }

    public async shutdown(): Promise<void> {
        const manager = this.app.make<any>('plugin.manager');
        // 如果有清理方法的话
        if (typeof manager.cleanup === 'function') {
            await manager.cleanup();
        }
    }

    public provides(): string[] {
        return ['plugin.manager'];
    }
} 