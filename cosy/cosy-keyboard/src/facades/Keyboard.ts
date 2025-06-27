/**
 * 键盘门面
 * 提供静态方法访问键盘服务
 */
import { Application } from '@coffic/cosy-framework';
import { KeyboardContract } from '../contracts/KeyboardContract.js';

export class Keyboard {
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
     * 获取键盘管理器实例
     */
    private static getManager(): KeyboardContract {
        return this.app.make<KeyboardContract>('keyboard');
    }

    /**
     * 注册全局快捷键
     */
    public static registerGlobalShortcut(accelerator: string, callback: () => void): void {
        this.getManager().registerGlobalShortcut(accelerator, callback);
    }

    /**
     * 取消注册全局快捷键
     */
    public static unregisterGlobalShortcut(accelerator: string): void {
        this.getManager().unregisterGlobalShortcut(accelerator);
    }

    /**
     * 设置Command键双击监听器
     */
    public static async setupCommandKeyListener(): Promise<{
        success: boolean;
        error?: Error;
    }> {
        return this.getManager().setupCommandKeyListener();
    }
} 