/**
 * 应用管理器契约
 * 定义了应用管理器需要实现的方法
 */
export interface AppContract {
    /**
     * 启动应用
     */
    start(): Promise<void>;

    /**
     * 清理资源
     */
    cleanup(): void;
} 