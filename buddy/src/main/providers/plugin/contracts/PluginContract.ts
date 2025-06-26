/**
 * 插件系统相关契约
 */

/**
 * 插件管理器契约
 */
export interface PluginContract {
    /**
     * 获取所有插件
     */
    getPlugins(): Promise<any[]>;

    /**
     * 获取指定插件
     * @param id 插件ID
     */
    getPlugin(id: string): Promise<any | null>;

    /**
     * 执行插件动作
     * @param actionId 动作ID
     * @param keyword 关键词
     */
    executeAction(actionId: string, keyword: string): Promise<any>;

    /**
     * 初始化插件系统
     */
    initialize(): Promise<void>;

    /**
     * 清理资源
     */
    cleanup(): void;
} 