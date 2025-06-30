/**
 * 插件服务提供者
 * 负责注册插件相关的服务
 */
import { ServiceProvider, SettingFacade } from '@coffic/cosy-framework';
import { PluginManager } from './manager/PluginManager.js';
import { IPluginManager } from './contract/IPluginManager.js';
import { DevPluginRepo } from './repo/DevPluginRepo.js';

export class PluginServiceProvider extends ServiceProvider {
  /**
   * 注册插件服务
   */
  public register(): void {
    // 注册插件管理器
    this.app.container().singleton('plugin', () => {
      const devPath = SettingFacade.get('plugins.dev.path', null);
      const devPluginDB = new DevPluginRepo(devPath);

      return new PluginManager(devPluginDB);
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
   * 获取提供的服务
   */
  public provides(): string[] {
    return ['plugin', 'plugin.repo.dev'];
  }
}
