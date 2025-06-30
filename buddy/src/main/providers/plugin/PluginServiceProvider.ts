/**
 * 插件服务提供者
 * 负责注册插件相关的服务
 */
import { ServiceProvider, SettingFacade } from '@coffic/cosy-framework';
import { PluginManager } from './PluginManager.js';
import { PluginContract } from './contracts/PluginContract.js';
import { DevPluginRepo } from './repo/DevPluginRepo.js';

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
  }

  /**
   * 启动插件服务
   */
  public async boot(): Promise<void> {
    const manager = this.app.make<PluginContract>('plugin');
    await manager.initialize();
  }

  /**
   * 关闭插件服务
   */
  public async shutdown(): Promise<void> {
    const manager = this.app.make<PluginContract>('plugin');
    manager.cleanup();
  }

  /**
   * 获取提供的服务
   */
  public provides(): string[] {
    return ['plugin', 'plugin.repo.dev'];
  }
}
