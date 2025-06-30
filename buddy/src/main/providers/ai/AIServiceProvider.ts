/**
 * AI服务提供者
 * 负责注册AI管理器相关的服务
 */
import { ServiceProvider } from '@coffic/cosy-framework';
import { AIManager } from './AIManager.js';
import { AIContract } from './contracts/AIContract.js';

export class AIServiceProvider extends ServiceProvider {
    /**
     * 注册AI服务
     */
    public register(): void {
        // 注册AI管理器
        this.app.container().singleton('ai', () => {
            return AIManager.getInstance();
        });
    }

    /**
     * 启动AI服务
     */
    public async boot(): Promise<void> {
        const manager = this.app.make<AIContract>('ai');
        await manager.start();
    }

    /**
     * 关闭AI服务
     */
    public async shutdown(): Promise<void> {
        const manager = this.app.make<AIContract>('ai');
        manager.cleanup();
    }

    /**
     * 获取提供的服务
     */
    public provides(): string[] {
        return ['ai'];
    }
} 