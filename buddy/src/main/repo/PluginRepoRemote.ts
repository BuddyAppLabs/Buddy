/**
 * 远程插件数据库
 * 负责从远程 npm registry 获取插件并缓存
 */
import { npmRegistryService } from '../service/NpmRegistryService.js';
import { PackageEntity } from '../entities/PackageEntity.js';
import { PackageJson } from '@/types/package-json.js';
import { SendablePlugin } from '@/types/sendable-plugin.js';
import { PluginEntity } from '../entities/PluginEntity.js';
import { EMOJI } from '../constants.js';

const verbose = false;
const logger = console;

/**
 * 远程插件仓库
 * 负责从远程 npm registry 获取插件并缓存
 */
export class PluginRepoRemote {
    private static instance: PluginRepoRemote;

    // 缓存刷新时间间隔 (毫秒): 1小时
    private readonly CACHE_REFRESH_INTERVAL = 60 * 60 * 1000;

    // 上次缓存刷新时间
    private lastCacheRefreshTime: number = 0;

    // 包列表缓存
    private cachedRemotePackages: PackageEntity[] = [];

    /**
     * 刷新缓存标志，防止并发刷新
     */
    private isRefreshingCache = false;

    private constructor() {
        // 初始化时立即刷新包列表
        this.refreshRemotePackages();
    }

    public static getInstance(): PluginRepoRemote {
        if (!PluginRepoRemote.instance) {
            PluginRepoRemote.instance = new PluginRepoRemote();
        }
        return PluginRepoRemote.instance;
    }

    /**
     * 获取远程包列表
     */
    public async getPackages(): Promise<PackageEntity[]> {
        try {
            // 检查缓存是否过期
            if (
                this.shouldRefreshCache() &&
                !this.isRefreshingCache // 防止并发刷新
            ) {
                this.isRefreshingCache = true;
                // 先返回缓存数据，在后台刷新
                const result = await this.searchPackages();
                this.cachedRemotePackages = result;
                this.lastCacheRefreshTime = Date.now();
                this.isRefreshingCache = false;

                if (verbose) {
                    logger.info(`${EMOJI} [PluginRepoRemote] 远程包列表缓存已更新，数量`, this.cachedRemotePackages.length);
                }

                return this.cachedRemotePackages;
            }

            // 返回缓存数据
            return this.cachedRemotePackages;
        } catch (error) {
            logger.error(
                `获取远程插件列表失败: ${error instanceof Error ? error.message : String(error)}`
            );
            return [];
        }
    }

    /**
     * 获取远程插件列表
     */
    public async getPlugins(): Promise<PluginEntity[]> {
        const packages = await this.getPackages();
        const plugins: PluginEntity[] = [];
        for (const pkg of packages) {
            const plugin = pkg.getPlugin();
            if (plugin) {
                plugins.push(plugin);
            }
        }
        return plugins;
    }

    public async getSendablePlugins(): Promise<SendablePlugin[]> {
        const plugins = await this.getPlugins();
        return await Promise.all(plugins.map((plugin) => plugin.getSendablePlugin()));
    }

    /**
     * 搜索并处理包
     */
    private async searchPackages(): Promise<PackageEntity[]> {
        try {
            const packages = await npmRegistryService.searchPackagesByKeyword('buddy-plugin');
            return packages.map((pkg: PackageJson) => PackageEntity.fromNpmPackage(pkg, 'remote'));
        } catch (error) {
            logger.error(
                `搜索包失败: ${error instanceof Error ? error.message : String(error)}`
            );
            return [];
        }
    }

    /**
     * 刷新远程包列表缓存
     */
    private async refreshRemotePackages(): Promise<void> {
        try {
            if (verbose) {
                logger.info('开始刷新远程包列表缓存');
            }

            // 搜索 buddy-plugin 关键词
            const packages = await this.searchPackages();

            if (packages && Array.isArray(packages) && packages.length > 0) {
                this.cachedRemotePackages = packages;
                this.lastCacheRefreshTime = Date.now();
                logger.info(`${EMOJI} [PluginRepoRemote] 远程包列表缓存已更新, count`, packages.length);
                return;
            }

            logger.warn(`${EMOJI} [PluginRepoRemote] 未能获取远程包列表`);
        } catch (error) {
            logger.error(`${EMOJI} [PluginRepoRemote] 刷新远程插件列表失败`, {
                error: error instanceof Error ? error.message : String(error),
            });
        }

        // 设置定时刷新
        setInterval(() => {
            this.refreshRemotePackages();
        }, this.CACHE_REFRESH_INTERVAL);
    }

    /**
     * 判断缓存是否需要刷新
     */
    private shouldRefreshCache(): boolean {
        const now = Date.now();
        return now - this.lastCacheRefreshTime > this.CACHE_REFRESH_INTERVAL;
    }
}

// 导出单例
export const remotePluginDB = PluginRepoRemote.getInstance();
