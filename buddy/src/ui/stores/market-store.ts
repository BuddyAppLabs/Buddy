import { defineStore } from 'pinia';
import { marketIpc } from '../ipc/market-ipc.js';
import { SendablePlugin } from '@/types/sendable-plugin';
import { MarketTab } from '@/types/market-type';

const verbose = true;
const title = '🛍️ 插件市场';
const logger = console;

interface MarketState {
  error: string;
  userPlugins: SendablePlugin[];
  devPlugins: SendablePlugin[];
  remotePlugins: SendablePlugin[];
  loadingPlugins: boolean;
  loadingRemotePlugins: boolean;
  downloadingPlugins: Set<string>;
  uninstallingPlugins: Set<string>;
  userPluginDirectory: string;
  devPluginDirectory: string;
  devPackageDirectory: string;
  devPackage: SendablePlugin | null;
  activeTab: MarketTab;
}

export const useMarketStore = defineStore('market', {
  state: (): MarketState => ({
    error: '',
    userPlugins: [],
    devPlugins: [],
    remotePlugins: [],
    loadingPlugins: false,
    loadingRemotePlugins: false,
    downloadingPlugins: new Set<string>(),
    uninstallingPlugins: new Set<string>(),
    userPluginDirectory: '',
    devPluginDirectory: '',
    devPackageDirectory: '',
    devPackage: null,
    activeTab: 'user',
  }),

  actions: {
    /**
     * 初始化
     */
    async onMounted() {
      this.activeTab = 'user';
      this.userPluginDirectory = await marketIpc.getUserPluginDirectory();
      this.devPluginDirectory = await marketIpc.getDevPluginDirectory();
      this.devPackageDirectory = await marketIpc.getDevPackageDirectory();
      await this.loadUserPlugins();
      await this.loadRemotePlugins();
      await this.loadDevPlugins();
      await this.loadDevPackage();
    },

    // 加载开发插件列表
    async loadDevPlugins(): Promise<void> {
      this.loadingPlugins = true;

      try {
        this.devPlugins = await marketIpc.getDevPlugins();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.error = `加载插件列表失败: ${errorMsg}`;
        logger.error('Failed to load plugins:', err);
        throw err;
      } finally {
        this.loadingPlugins = false;

        if (verbose) {
          logger.debug(
            `${title} 加载开发插件列表完成，插件数量：${this.devPlugins.length}`
          );
        }
      }
    },

    getPluginsWithPage(): SendablePlugin[] {
      return [
        ...this.devPlugins.filter((plugin) => plugin.pagePath),
        ...this.userPlugins.filter((plugin) => plugin.pagePath),
        ...(this.devPackage
          ? [this.devPackage].filter((plugin) => plugin.pagePath)
          : []),
      ];
    },

    // 加载开发包
    async loadDevPackage(): Promise<void> {
      this.devPackage = await marketIpc.getDevPackage();
    },

    // 加载用户插件列表
    async loadUserPlugins(): Promise<void> {
      logger.debug('加载用户插件列表');

      this.loadingPlugins = true;

      try {
        this.userPlugins = await marketIpc.getUserPlugins();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.error = `加载插件列表失败: ${errorMsg}`;
        console.error('Failed to load plugins:', err);
        throw err;
      } finally {
        this.loadingPlugins = false;
      }
    },

    // 下载插件
    async downloadPlugin(plugin: SendablePlugin) {
      if (this.downloadingPlugins.has(plugin.id)) {
        console.log('downloadPlugin already downloading', plugin.id);
        return; // 避免重复下载
      }

      this.downloadingPlugins.add(plugin.id);
      await marketIpc.downloadPlugin(plugin.id);
      this.downloadingPlugins.delete(plugin.id);
      await this.loadUserPlugins();
      await this.loadRemotePlugins();
    },

    // 卸载插件
    async uninstallPlugin(pluginId: string) {
      if (this.uninstallingPlugins.has(pluginId)) {
        return; // 避免重复操作
      }

      this.uninstallingPlugins.add(pluginId);
      await marketIpc.uninstallPlugin(pluginId);
      this.uninstallingPlugins.delete(pluginId);

      logger.debug('卸载插件后刷新插件列表', pluginId);
      await this.loadUserPlugins();
      await this.loadRemotePlugins();
    },

    // 加载远程插件列表
    async loadRemotePlugins(): Promise<void> {
      if (this.loadingRemotePlugins) {
        console.warn('loadRemotePlugins already loading');
        return;
      }

      this.loadingRemotePlugins = true;

      try {
        const plugins = await marketIpc.getRemotePlugins();

        this.remotePlugins = plugins;
      } catch (err) {
        throw err;
      } finally {
        this.loadingRemotePlugins = false;
      }
    },

    // 更新用户插件目录
    async updateUserPluginDirectory() {
      this.userPluginDirectory = await marketIpc.getUserPluginDirectory();
    },

    // 更新开发插件目录
    async updateDevPluginDirectory() {
      this.devPluginDirectory = await marketIpc.getDevPluginDirectory();
    },

    // 更新开发包目录
    async updateDevPackageDirectory() {
      this.devPackageDirectory = await marketIpc.getDevPackageDirectory();
    },

    getCurrentPluginDirectory(): string | null {
      console.log('getCurrentPluginDirectory', this.activeTab);

      if (this.activeTab === 'devRepo') {
        return this.devPluginDirectory;
      }

      if (this.activeTab === 'user') {
        return this.userPluginDirectory;
      }

      return null;
    },
  },
});
