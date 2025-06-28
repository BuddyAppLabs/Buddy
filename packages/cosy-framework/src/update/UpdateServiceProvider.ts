import { ServiceProvider } from '../providers/ServiceProvider.js';
import { UpdateManager } from './UpdateManager.js';
import { UpdateContract } from './contracts/UpdateContract.js';
import { AppContract, IApplication } from '../application/Application.js';
import { ConfigManager } from '../config/types.js';
import { LogManagerContract } from '../contract/logger/index.js';

export class UpdateServiceProvider extends ServiceProvider {
  public register(): void {
    this.app.singleton(UpdateContract, () => {
      return new UpdateManager(
        this.app.make<IApplication>(AppContract),
        this.app.make<ConfigManager>('config'),
        this.app.make<LogManagerContract>('log')
      );
    });
  }

  public async boot(): Promise<void> {
    const updateManager = this.app.make<UpdateManager>(UpdateContract);
    updateManager.boot();
  }
}
