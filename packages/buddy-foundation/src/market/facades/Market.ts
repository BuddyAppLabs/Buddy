/**
 * 插件市场门面
 * 提供静态方法访问插件市场服务
 */
import { Application } from '@coffic/cosy';
import { MarketContract } from '../contracts/MarketContract.js';

export class Market {
    /**
     * 应用实例
     */
    private static app: Application;

    /**
     * 设置应用实例
     */
    public static setApp(app: Application): void {
        this.app = app;
    }

    /**
     * 获取市场管理器实例
     */
    private static getManager(): MarketContract {
        return this.app.make<MarketContract>('market');
    }

    /**
     * 安装插件
     */
    public static async install(packageName: string): Promise<void> {
        await this.getManager().install(packageName);
    }

    /**
     * 卸载插件
     */
    public static async uninstall(packageName: string): Promise<void> {
        await this.getManager().uninstall(packageName);
    }

    /**
     * 更新插件
     */
    public static async update(packageName: string): Promise<void> {
        await this.getManager().update(packageName);
    }

    /**
     * 获取插件仓储
     */
    public static getRepository() {
        return this.getManager().getRepository();
    }

    /**
     * 获取下载器
     */
    public static getDownloader() {
        return this.getManager().getDownloader();
    }
} 