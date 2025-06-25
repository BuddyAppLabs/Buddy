/**
 * 插件市场服务提供者
 * 负责注册插件市场相关的服务
 */
import { ServiceProvider } from '@coffic/cosy';
import { MarketContract, MarketRepositoryContract, MarketDownloaderContract } from './contracts/MarketContract.js';
import { MarketManager } from './MarketManager.js';

export class MarketServiceProvider extends ServiceProvider {
    /**
     * 注册插件市场服务
     */
    public register(): void {
        console.log('🚀 MarketServiceProvider register');

        // 注册插件市场服务
        this.app.container().singleton('market', () => {
            const repository = this.app.container().resolve('market.repository') as MarketRepositoryContract;
            const downloader = this.app.container().resolve('market.downloader') as MarketDownloaderContract;
            return new MarketManager(repository, downloader);
        });
    }

    /**
     * 启动插件市场服务
     */
    public async boot(): Promise<void> {
        // 在这里可以添加启动时的初始化逻辑
        // 比如检查插件目录、加载配置等
    }

    /**
     * 获取提供的服务
     */
    public provides(): string[] {
        return ['market'];
    }
} 