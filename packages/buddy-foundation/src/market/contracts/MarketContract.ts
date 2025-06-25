/**
 * 插件市场相关契约
 */

/**
 * 插件仓储契约
 */
export interface MarketRepositoryContract {
    /**
     * 安装插件
     * @param packageName 包名
     */
    install(packageName: string): Promise<void>;

    /**
     * 卸载插件
     * @param packageName 包名
     */
    uninstall(packageName: string): Promise<void>;

    /**
     * 更新插件
     * @param packageName 包名
     */
    update(packageName: string): Promise<void>;

    /**
     * 获取已安装的插件列表
     */
    getInstalledPlugins(): Promise<string[]>;
}

/**
 * 下载器契约
 */
export interface MarketDownloaderContract {
    /**
     * 下载插件包
     * @param packageName 包名
     */
    download(packageName: string): Promise<void>;

    /**
     * 获取插件包信息
     * @param packageName 包名
     */
    getPackageInfo(packageName: string): Promise<{
        name: string;
        version: string;
        description?: string;
    }>;
}

/**
 * 插件市场服务契约
 */
export interface MarketContract {
    /**
     * 获取插件仓储
     */
    getRepository(): MarketRepositoryContract;

    /**
     * 获取下载器
     */
    getDownloader(): MarketDownloaderContract;

    /**
     * 安装插件
     * @param packageName 包名
     */
    install(packageName: string): Promise<void>;

    /**
     * 卸载插件
     * @param packageName 包名
     */
    uninstall(packageName: string): Promise<void>;

    /**
     * 更新插件
     * @param packageName 包名
     */
    update(packageName: string): Promise<void>;
} 