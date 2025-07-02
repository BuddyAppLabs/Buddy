import { ServiceProvider } from './ServiceProvider.js';
import { SettingManager } from './SettingManager.js';
import * as path from 'path';
import { ISettingManager } from '../contract/setting/ISettingManager.js';
import { SettingAbstract, SettingAlias } from '../constants.js';

export class SettingServiceProvider extends ServiceProvider {
  public register(): void {
    this.app.singleton(SettingAbstract, () => {
      const filePath = path.join(this.app.userDataPath(), 'settings.json');
      return new SettingManager(filePath, this.app.config().debug);
    });

    SettingAlias.forEach((alias) => {
      this.app.container().alias(alias, SettingAbstract);
    });
  }

  public async boot(): Promise<void> {
    const manager = this.app.make<ISettingManager>(SettingAbstract);
    await manager.load();
  }

  public async shutdown(): Promise<void> {
    const manager = this.app.make<ISettingManager>(SettingAbstract);
    await manager.save();
  }
}
