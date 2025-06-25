/**
 * 窗口管理器的契约接口
 * 定义了窗口管理相关的核心功能
 */
import { BrowserWindow } from 'electron';

/**
 * 窗口配置接口
 */
export interface WindowConfig {
    showTrafficLights: boolean;
    showDebugToolbar: boolean;
    debugToolbarPosition: 'bottom' | 'right' | 'left' | 'undocked' | 'detach';
    hotkey: string;
    size: {
        width: number;
        height: number;
    };
    alwaysOnTop: boolean;
    opacity: number;
}

/**
 * 窗口管理器契约
 */
export interface WindowManagerContract {
    /**
     * 获取主窗口实例
     */
    getMainWindow(): BrowserWindow | null;

    /**
     * 创建主窗口
     */
    createWindow(): BrowserWindow;

    /**
     * 显示或隐藏主窗口
     */
    toggleMainWindow(): void;

    /**
     * 设置全局快捷键
     */
    setupGlobalShortcut(): void;

    /**
     * 清理资源
     */
    cleanup(): void;
}

/**
 * 窗口管理器工厂契约
 */
export interface WindowManagerFactoryContract {
    /**
     * 创建窗口管理器实例
     */
    createManager(config: WindowConfig): WindowManagerContract;
} 