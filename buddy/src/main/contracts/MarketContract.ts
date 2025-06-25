/**
 * 插件市场服务接口
 * 定义了插件市场相关的功能
 */

export interface MarketRepositoryContract {
    /**
     * 获取插件根目录
     */
    getRootDir(): string;

    /**
     * 查找插件
     */
    find(pluginId: string): Promise<any>;

    /**
     * 获取所有插件
     */
    getAllPlugins(): Promise<any[]>;
}

export interface MarketDownloaderContract {
    /**
     * 下载并解压插件包
     */
    downloadAndExtractPackage(pluginId: string, targetDir: string): Promise<void>;
}

export interface MarketContract {
    /**
     * 下载并安装插件
     * @param pluginId 插件ID
     */
    downloadAndInstallPlugin(pluginId: string): Promise<void>;

    /**
     * 卸载插件
     * @param pluginId 插件ID
     */
    uninstallPlugin(pluginId: string): Promise<void>;
} 