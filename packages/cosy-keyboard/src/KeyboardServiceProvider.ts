/**
 * 键盘服务提供者
 * 负责注册和启动键盘相关服务
 */
import { ServiceProvider, Config } from '@coffic/cosy-framework';
import { KeyboardContract } from './contracts/KeyboardContract.js';
import { KeyManager } from './KeyManager.js';

export class KeyboardServiceProvider extends ServiceProvider {
  /**
   * 注册键盘服务
   */
  public register(): void {
    // 注册键盘管理器为单例
    this.app.singleton('keyboard', () => {
      // 1. 读取用户配置，如果用户没有配置，则使用包内默认值
      const keycodesConfig = Config.get('keyboard.hotkey', {
        development: [58, 61], // 左/右 Option
        production: [54, 55], // 左/右 Command
      });

      // 2. 根据当前环境选择要使用的 keycodes
      const keycodes = this.app.isDevelopment()
        ? keycodesConfig.development
        : keycodesConfig.production;

      // 3. 将最终的 keycodes 注入 KeyManager
      return new KeyManager(this.app, keycodes);
    });

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
