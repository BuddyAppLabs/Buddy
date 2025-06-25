/**
 * 键盘管理器接口
 * 定义了键盘事件监听和管理的功能
 */
export interface KeyContract {
    /**
     * 设置键盘快捷键监听器
     * 在开发环境下监听 Option 键双击
     * 在生产环境(打包后)监听 Command 键双击
     */
    setupCommandKeyListener(): Promise<{ success: boolean; error?: string }>;
} 