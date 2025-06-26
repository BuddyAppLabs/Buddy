/**
 * 应用管理器
 * 负责应用的生命周期管理
 */
import { app } from 'electron';
import { AppContract } from './contracts/AppContract.js';

export class AppManager implements AppContract {
    private static instance: AppManager;

    private constructor() {
        // 监听应用退出事件
        app.on('will-quit', () => {
            this.cleanup();
        });
    }

    /**
     * 获取实例
     */
    public static getInstance(): AppManager {
        if (!AppManager.instance) {
            AppManager.instance = new AppManager();
        }
        return AppManager.instance;
    }

    /**
     * 启动应用
     */
    public async start(): Promise<void> {
        // 这里可以添加应用启动时的初始化逻辑
    }

    /**
     * 清理资源
     */
    public cleanup(): void {
        // 这里可以添加应用退出时的清理逻辑
        console.log('👋 应用退出');
    }
}

// 导出单例
export const appManager = AppManager.getInstance();
