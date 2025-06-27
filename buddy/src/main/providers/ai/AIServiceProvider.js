/**
 * AI服务提供者
 * 负责注册AI管理器相关的服务
 */
import { ServiceProvider } from '@coffic/cosy-framework';
import { AIManager } from './AIManager.js';
export class AIServiceProvider extends ServiceProvider {
    /**
     * 注册AI服务
     */
    register() {
        // 注册AI管理器
        this.app.container().singleton('ai', () => {
            return AIManager.getInstance();
        });
    }
    /**
     * 启动AI服务
     */
    async boot() {
        const manager = this.app.make('ai');
        await manager.start();
    }
    /**
     * 关闭AI服务
     */
    async shutdown() {
        const manager = this.app.make('ai');
        manager.cleanup();
    }
    /**
     * 获取提供的服务
     */
    provides() {
        return ['ai'];
    }
}
//# sourceMappingURL=AIServiceProvider.js.map