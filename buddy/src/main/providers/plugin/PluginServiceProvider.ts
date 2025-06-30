/**
 * 插件服务提供者
 * 负责注册插件相关的服务
 */
import { ServiceProvider, SettingFacade } from '@coffic/cosy-framework';
import { PluginManager } from './manager/PluginManager.js';
import { IPluginManager } from './contract/IPluginManager.js';
import { DevPluginRepo } from './repo/DevPluginRepo.js';
import { IMarketRepo } from './contract/IMarketRepo.js';
import { MarketManager } from './manager/MarketManager.js';
import { IDownloader } from './contract/IDownloader.js';

export class PluginServiceProvider extends ServiceProvider {
  /**
   * 注册插件服务
   */
  public register(): void {
    // 注册开发插件仓库
    this.app.container().singleton('plugin.repo.dev', () => {
      const devPath = SettingFacade.get('plugins.dev.path', null);
      return new DevPluginRepo(devPath);
    });

    // 注册插件管理器
    this.app.container().singleton('plugin', () => {
      const devPluginDB = this.app.make<DevPluginRepo>('plugin.repo.dev');
      return new PluginManager(devPluginDB);
    });

    // 注册插件市场服务
    this.app.container().singleton('market', () => {
      const repository = this.app
        .container()
        .resolve('market.repository') as IMarketRepo;
      const downloader = this.app
        .container()
        .resolve('market.downloader') as IDownloader;
      return new MarketManager(repository, downloader);
    });
  }

  /**
   * 启动插件服务
   */
  public async boot(): Promise<void> {
    const manager = this.app.make<IPluginManager>('plugin');
    await manager.initialize();
  }

  /**
   * 关闭插件服务
   */
  public async shutdown(): Promise<void> {
    const manager = this.app.make<IPluginManager>('plugin');
    manager.cleanup();
  }

  /**
   * 获取提供的服务
   */
  public provides(): string[] {
    return ['plugin', 'plugin.repo.dev'];
  }
}
