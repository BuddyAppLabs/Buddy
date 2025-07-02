/**
 * State服务提供者
 * 负责注册StateManager相关的服务
 */
import { ServiceProvider } from '@coffic/cosy-framework';
import { appStateManager } from './StateManager.js';

export class StateServiceProvider extends ServiceProvider {
  /**
   * 注册State服务
   */
  public register(): void {
    // 注册StateManager单例
    this.app.container().singleton('state', () => {
      return appStateManager;
    });
  }

  /**
   * 启动State服务
   */
  public async boot(): Promise<void> {}

  /**
   * 关闭State服务
   */
  public async shutdown(): Promise<void> {}

  /**
   * 获取提供的服务
   */
  public provides(): string[] {
    return ['state'];
  }
}
