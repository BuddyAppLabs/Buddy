import { ServiceProvider } from '../providers/ServiceProvider.js';
import { UpdateManager } from './UpdateManager.js';
import { UpdateContract } from './IUpdateConfig.js';
import { AppContract, IApplication } from '../application/Application.js';
import { ConfigManager } from '../config/types.js';
import { ILogManager } from '../contract/logger/ILogManager.js';

export class UpdateServiceProvider extends ServiceProvider {
  public register(): void {
    this.app.singleton(UpdateContract, () => {
      return new UpdateManager(
        this.app.make<IApplication>(AppContract),
        this.app.make<ConfigManager>('config'),
        this.app.make<ILogManager>('log')
      );
    });
  }

  public async boot(): Promise<void> {
    const updateManager = this.app.make<UpdateManager>(UpdateContract);
    updateManager.boot();
  }
}
