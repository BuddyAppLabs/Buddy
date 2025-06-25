/**
 * 按键管理器
 * 负责处理macOS平台按键的监听和响应
 */
import { KeyListener } from '@coffic/key-listener';
import { Window } from '../facades/Window.js';
import { is } from '@electron-toolkit/utils';
import { app } from 'electron';
import { KeyContract } from '../contracts/KeyContract.js';

const logger = console;

export class KeyManager implements KeyContract {
  private static instance: KeyManager;
  // 记录每个keyCode上次按下的时间
  private lastPressTime: { [key: number]: number } = {};
  // 双击时间阈值（毫秒）
  private static readonly DOUBLE_PRESS_THRESHOLD = 300;

  /**
   * 键盘按键码
   * 开发环境和生产环境使用不同的键：
   * - 开发环境：Option 键 (58, 61) - 避免与开发工具的 Command 键冲突
   * - 生产环境：Command 键 (54, 55) - 正式环境下使用 Command 键
   */
  private get keycodesToMonitor(): number[] {
    // 判断当前环境
    const isDevelopment = is.dev;

    if (isDevelopment) {
      // 开发环境: 监听 Option 键 (左58, 右61)
      logger.debug('开发环境: 监听 Option 键 (58, 61)');
      return [58, 61];
    } else {
      // 生产环境: 监听 Command 键 (左54, 右55)
      logger.info('生产环境: 监听 Command 键 (54, 55)');
      return [54, 55];
    }
  }

  /**
   * 获取 CommandKeyManager 实例
   */
  public static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

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
  async setupCommandKeyListener(): Promise<{ success: boolean; error?: string }> {
    try {
      const keyCodes = this.keycodesToMonitor;
      const keyNames = !app.isPackaged ? 'Option' : 'Command';

      // 创建监听器实例
      const listener = new KeyListener();

      // 监听键盘事件
      listener.on('keypress', (event) => {
        if (keyCodes.includes(event.keyCode)) {
          const now = Date.now();
          const lastTime = this.lastPressTime[event.keyCode] || 0;

          // 检查是否是双击（两次按键间隔小于阈值）
          if (now - lastTime < KeyManager.DOUBLE_PRESS_THRESHOLD) {
            Window.toggleMainWindow();
          }

          // 更新最后按键时间
          this.lastPressTime[event.keyCode] = now;
        }
      });

      // 启动监听器
      const success = await listener.start();
      if (!success) {
        const error = `${keyNames}键监听器启动失败`;
        logger.error(error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      logger.error('键盘监听器设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
}

// 导出单例
export const commandKeyManager = KeyManager.getInstance();
