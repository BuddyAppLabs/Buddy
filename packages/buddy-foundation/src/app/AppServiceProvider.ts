/**
 * 应用服务提供者
 * 负责注册应用管理器相关的服务
 */
import { ServiceProvider } from '@coffic/cosy';
import { AppManager } from './AppManager.js';
import { AppContract } from './contracts/AppContract.js';

export class AppServiceProvider extends ServiceProvider {
    /**
     * 注册应用服务
     */
    public register(): void {
        console.log('🚀 AppServiceProvider register');

        // 注册应用管理器
        this.app.container().singleton('app', () => {
            return AppManager.getInstance();
        });
    }

    /**
     * 启动应用服务
     */
    public async boot(): Promise<void> {
        const manager = this.app.make<AppContract>('app');
        await manager.start();
    }

    /**
     * 关闭应用服务
     */
    public async shutdown(): Promise<void> {
        const manager = this.app.make<AppContract>('app');
        // 清理由应用退出事件自动处理
        console.log('AppManager 清理由应用退出事件自动处理');
    }

    /**
     * 获取提供的服务
     */
    public provides(): string[] {
        return ['app'];
    }
} 