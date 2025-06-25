/**
 * 键盘管理器
 * 负责处理全局键盘事件和快捷键
 */
import { globalShortcut } from 'electron';
import { KeyboardContract } from './contracts/KeyboardContract.js';

export class KeyboardManager implements KeyboardContract {
    /**
     * 已注册的快捷键映射
     */
    private shortcuts: Map<string, () => void> = new Map();

    /**
     * 设置Command键双击监听器
     */
    public async setupCommandKeyListener(): Promise<{
        success: boolean;
        error?: Error;
    }> {
        try {
            // TODO: 实现Command键双击监听器
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error as Error
            };
        }
    }

    /**
     * 注册全局快捷键
     */
    public registerGlobalShortcut(accelerator: string, callback: () => void): void {
        if (this.shortcuts.has(accelerator)) {
            this.unregisterGlobalShortcut(accelerator);
        }

        try {
            globalShortcut.register(accelerator, callback);
            this.shortcuts.set(accelerator, callback);
        } catch (error) {
            console.error('注册全局快捷键失败:', error);
            throw error;
        }
    }

    /**
     * 取消注册全局快捷键
     */
    public unregisterGlobalShortcut(accelerator: string): void {
        if (this.shortcuts.has(accelerator)) {
            globalShortcut.unregister(accelerator);
            this.shortcuts.delete(accelerator);
        }
    }

    /**
     * 清理所有注册的快捷键
     * 在应用退出时调用
     */
    public cleanup(): void {
        globalShortcut.unregisterAll();
        this.shortcuts.clear();
    }
} 