import * as fs from 'fs';
import * as path from 'path';
import { BaseManager } from './BaseManager.js';
import { MarketContract, MarketRepositoryContract, MarketDownloaderContract } from '../contracts/MarketContract.js';

/**
 * 插件市场管理器
 * 负责处理插件的下载、安装、卸载等操作
 */
export class MarketManager extends BaseManager implements MarketContract {
    private repository: MarketRepositoryContract;
    private downloader: MarketDownloaderContract;

    constructor(repository: MarketRepositoryContract, downloader: MarketDownloaderContract) {
        super({
            name: 'MarketManager',
            enableLogging: true,
            logLevel: 'info'
        });
        this.repository = repository;
        this.downloader = downloader;
    }

    /**
     * 下载并安装插件
     * @param pluginId 插件ID
     */
    public async downloadAndInstallPlugin(pluginId: string): Promise<void> {
        try {
            const userPluginDir = this.repository.getRootDir();
            if (!fs.existsSync(userPluginDir)) {
                fs.mkdirSync(userPluginDir, { recursive: true });
            }

            // 处理插件ID中的特殊字符，确保文件路径安全
            const safePluginId = pluginId.replace(/[@/]/g, '-');
            const pluginDir = path.join(userPluginDir, safePluginId);
            if (!fs.existsSync(pluginDir)) {
                fs.mkdirSync(pluginDir, { recursive: true });
            }

            await this.downloader.downloadAndExtractPackage(pluginId, pluginDir);
            await this.repository.getAllPlugins();
        } catch (error) {
            this.handleError(error, '下载插件失败', true);
        }
    }

    /**
     * 卸载插件
     * @param pluginId 插件ID
     */
    public async uninstallPlugin(pluginId: string): Promise<void> {
        try {
            if (!pluginId) {
                throw new Error('插件ID不能为空');
            }

            const plugin = await this.repository.find(pluginId);

            if (!plugin) {
                throw new Error(`找不到插件: ${pluginId}`);
            }

            plugin.delete();
        } catch (error) {
            this.handleError(error, '卸载插件失败', true);
        }
    }

    /**
     * 清理资源
     */
    public cleanup(): void {
        // 目前没有需要清理的资源
    }
}