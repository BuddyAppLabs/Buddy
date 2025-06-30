import { ServiceProvider } from './ServiceProvider.js';
import { SettingManager } from '../setting/SettingManager.js';
import * as path from 'path';
import { ISettingManager } from '../contract/setting/ISettingManager.js';

export class SettingServiceProvider extends ServiceProvider {
  public register(): void {
    this.app.singleton('setting.manager', () => {
      const filePath = path.join(this.app.userDataPath(), 'settings.json');
      return new SettingManager(filePath);
    });

    this.app.container().alias('SettingManager', 'setting.manager');
  }

  public async boot(): Promise<void> {
    const manager = this.app.make<ISettingManager>('setting.manager');
    await manager.load();
  }

  public async shutdown(): Promise<void> {
    const manager = this.app.make<ISettingManager>('setting.manager');
    await manager.save();
  }
}
