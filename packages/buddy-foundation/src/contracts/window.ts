/**
 * 窗口配置接口
 */
export interface WindowConfig {
    showTrafficLights?: boolean;
    showDebugToolbar?: boolean;
    debugToolbarPosition?: 'left' | 'right' | 'bottom' | 'undocked' | 'detach';
    hotkey?: string;
    size: {
        width: number;
        height: number;
    };
    alwaysOnTop?: boolean;
    opacity?: number;
}

/**
 * 窗口管理器接口
 */
export interface WindowManagerContract {
    /**
     * 创建主窗口
     */
    createWindow(): Electron.BrowserWindow;

    /**
     * 获取主窗口实例
     */
    getMainWindow(): Electron.BrowserWindow | null;

    /**
     * 切换主窗口显示状态
     */
    toggleMainWindow(): void;

    /**
     * 设置全局快捷键
     */
    setupGlobalShortcut(): void;

    /**
     * 更新窗口配置
     */
    updateConfig(newConfig: Partial<WindowConfig>): void;

    /**
     * 清理资源
     */
    cleanup(): void;
} 