/**
 * 插件门面
 * 提供静态方法访问插件服务
 */
import { Application } from '@coffic/cosy-framework';
import { PluginContract } from './contracts/PluginContract.js';

export class PluginFacade {
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
     * 获取插件管理器实例
     */
    private static getManager(): PluginContract {
        return this.app.make<PluginContract>('plugin');
    }

    /**
     * 获取所有插件
     */
    public static async getPlugins(): Promise<any[]> {
        return await this.getManager().getPlugins();
    }

    /**
     * 获取指定插件
     */
    public static async getPlugin(id: string): Promise<any | null> {
        return await this.getManager().getPlugin(id);
    }

    /**
     * 执行插件动作
     */
    public static async executeAction(actionId: string, keyword: string): Promise<any> {
        return await this.getManager().executeAction(actionId, keyword);
    }

    /**
     * 初始化插件系统
     */
    public static async initialize(): Promise<void> {
        await this.getManager().initialize();
    }

    /**
     * 清理资源
     */
    public static cleanup(): void {
        this.getManager().cleanup();
    }
} 