/**
 * AI服务提供者
 * 负责注册AI管理器相关的服务
 */
import { ServiceProvider } from '@coffic/cosy-framework';
export declare class AIServiceProvider extends ServiceProvider {
    /**
     * 注册AI服务
     */
    register(): void;
    /**
     * 启动AI服务
     */
    boot(): Promise<void>;
    /**
     * 关闭AI服务
     */
    shutdown(): Promise<void>;
    /**
     * 获取提供的服务
     */
    provides(): string[];
}
//# sourceMappingURL=AIServiceProvider.d.ts.map