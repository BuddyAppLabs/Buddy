/**
 * 按键管理器
 * 负责处理macOS平台按键的监听和响应
 */
import { KeyListener } from '@coffic/key-listener';
import { is } from '@electron-toolkit/utils';
import { app as electronApp } from 'electron';
import { Application } from '@coffic/cosy-framework';
import { KeyboardContract } from './contracts/KeyboardContract.js';

export class KeyManager implements KeyboardContract {
  // 记录每个keyCode上次按下的时间
  private lastPressTime: { [key: number]: number } = {};
  // 双击时间阈值（毫秒）
  private static readonly DOUBLE_PRESS_THRESHOLD = 300;

  constructor(
    private app: Application,
    private keycodesToMonitor: number[]
  ) {}

  /**
   * 设置键盘快捷键监听器
   *
   * 注意: 在开发环境下监听 Option 键双击
   * 在生产环境(打包后)监听 Command 键双击
   *
   * 这样设计是为了:
   * 1. 在开发时避免与IDE等开发工具的 Command 键冲突
   * 2. 在生产环境使用符合直觉的 Command 键
   */
  async setupCommandKeyListener(): Promise<{
    success: boolean;
    error?: Error;
  }> {
    const keyCodes = this.keycodesToMonitor;
    const keyNames = !electronApp.isPackaged ? 'Option' : 'Command';

    // 创建监听器实例
    const listener = new KeyListener();

    // 监听键盘事件
    listener.on('keypress', (event) => {
      if (keyCodes.includes(event.keyCode)) {
        const now = Date.now();
        const lastTime = this.lastPressTime[event.keyCode] || 0;

        // 检查是否是双击（两次按键间隔小于阈值）
        if (now - lastTime < KeyManager.DOUBLE_PRESS_THRESHOLD) {
          this.app.emit('hotkey:triggered');
        }

        // 更新最后按键时间
        this.lastPressTime[event.keyCode] = now;
      }
    });

    // 启动监听器（返回Promise）
    return listener.start().then((success) => {
      if (success === false) {
        const errorMsg = `${keyNames}键监听器启动失败`;
        console.error(errorMsg);
        return {
          success: false,
          error: new Error(errorMsg),
        };
      }
      return { success: true };
    });
  }

  registerGlobalShortcut(accelerator: string, callback: () => void): void {
    throw new Error('Method not implemented.');
  }

  unregisterGlobalShortcut(accelerator: string): void {
    throw new Error('Method not implemented.');
  }
}
