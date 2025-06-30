import { defineStore } from 'pinia';
import { marketIpc } from '../ipc/market-ipc.js';
import { SendablePlugin } from '@/types/sendable-plugin';

const verbose = true;
const title = '🛍️ 插件市场';
const logger = console;

interface MarketState {
  error: string;
  userPlugins: SendablePlugin[];
  devPlugins: SendablePlugin[];
  pluginsWithPage: SendablePlugin[];
  remotePlugins: SendablePlugin[];
  loadingPlugins: boolean;
  loadingRemotePlugins: boolean;
  downloadingPlugins: Set<string>;
  uninstallingPlugins: Set<string>;
  userPluginDirectory: string;
  devPluginDirectory: string;
  activeTab: 'user' | 'remote' | 'dev';
}

export const useMarketStore = defineStore('market', {
  state: (): MarketState => ({
    error: '',
    userPlugins: [],
    devPlugins: [],
    pluginsWithPage: [],
    remotePlugins: [],
    loadingPlugins: false,
    loadingRemotePlugins: false,
    downloadingPlugins: new Set<string>(),
    uninstallingPlugins: new Set<string>(),
    userPluginDirectory: '',
    devPluginDirectory: '',
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
      await this.loadUserPlugins();
      await this.loadRemotePlugins();
      await this.loadDevPlugins();
    },

    // 加载开发插件列表
    async loadDevPlugins(): Promise<void> {
      if (verbose) {
        logger.debug(`${title} 加载开发插件列表`);
      }

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
        this.pluginsWithPage = this.devPlugins.filter(
          (plugin) => plugin.pagePath
        );

        if (verbose) {
          logger.debug(
            `${title} 加载开发插件列表完成，插件数量：${this.devPlugins.length}`
          );
          logger.debug(
            `${title} 加载开发插件列表完成，有视图插件数量：${this.pluginsWithPage.length}`
          );
        }
      }
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
      console.log('loadRemotePlugins');
      if (this.loadingRemotePlugins) {
        console.log('loadRemotePlugins already loading');
        return;
      } else {
        console.log('loadRemotePlugins');
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

    getCurrentPluginDirectory(): string | null {
      console.log('getCurrentPluginDirectory', this.activeTab);

      if (this.activeTab === 'dev') {
        return this.devPluginDirectory;
      }

      if (this.activeTab === 'user') {
        return this.userPluginDirectory;
      }

      return null;
    },
  },
});
