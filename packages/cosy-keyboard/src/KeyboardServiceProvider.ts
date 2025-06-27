/**
 * 键盘服务提供者
 * 负责注册和启动键盘相关服务
 */
import { ServiceProvider } from '@coffic/cosy-framework';
import { KeyboardContract } from './contracts/KeyboardContract.js';
import { KeyManager } from './KeyManager.js';

export class KeyboardServiceProvider extends ServiceProvider {
  /**
   * 注册键盘服务
   */
  public register(): void {
    // 注册键盘管理器为单例
    this.app.singleton('keyboard', () => new KeyManager(this.app));

    // this.app.container().instance('keyboard', keyManager);
    this.app.container().alias('KeyboardManager', 'keyboard');
  }

  /**
   * 启动键盘服务
   */
  public async boot(): Promise<void> {
    const keyboardManager = this.app.make<KeyboardContract>('keyboard');

    // macOS特定配置
    if (process.platform === 'darwin') {
      const result = await keyboardManager.setupCommandKeyListener();
      if (result.success == false) {
        console.warn('Command键双击监听器设置失败', {
          error: result.error,
        });
      }
    }
  }
}
