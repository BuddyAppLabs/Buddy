/**
 * 应用门面
 * 提供静态方法访问应用服务
 */
import { Application } from '@coffic/cosy-framework';
import { AppContract } from '../contracts/AppContract.js';

export class App {
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
     * 获取应用管理器实例
     */
    private static getManager(): AppContract {
        return this.app.make<AppContract>('app');
    }

    /**
     * 启动应用
     */
    public static async start(): Promise<void> {
        await this.getManager().start();
    }

    /**
     * 清理资源
     */
    public static cleanup(): void {
        this.getManager().cleanup();
    }
} 