/**
 * 插件服务提供者
 * 负责注册插件相关的服务
 */
import { ServiceProvider } from '@coffic/cosy-framework';
import { PluginManager } from './PluginManager.js';
import { PluginContract } from './contracts/PluginContract.js';

export class PluginServiceProvider extends ServiceProvider {
    /**
     * 注册插件服务
     */
    public register(): void {
        // 注册插件管理器
        this.app.container().singleton('plugin', () => {
            return new PluginManager();
        });
    }

    /**
     * 启动插件服务
     */
    public async boot(): Promise<void> {
        const manager = this.app.make<PluginContract>('plugin');
        await manager.initialize();
    }

    /**
     * 关闭插件服务
     */
    public async shutdown(): Promise<void> {
        const manager = this.app.make<PluginContract>('plugin');
        manager.cleanup();
    }

    /**
     * 获取提供的服务
     */
    public provides(): string[] {
        return ['plugin'];
    }
} 