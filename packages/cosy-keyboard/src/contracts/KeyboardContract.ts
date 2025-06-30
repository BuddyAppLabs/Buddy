/**
 * 键盘服务契约
 * 定义键盘相关的功能接口
 */
export interface KeyboardContract {
  /**
   * 设置Command键双击监听器
   * @returns Promise<{success: boolean, error?: Error}>
   */
  setupCommandKeyListener(): Promise<{
    success: boolean;
    error?: Error;
  }>;

  /**
   * 注册全局快捷键
   * @param accelerator 快捷键组合
   * @param callback 回调函数
   */
  registerGlobalShortcut(accelerator: string, callback: () => void): void;

  /**
   * 取消注册全局快捷键
   * @param accelerator 快捷键组合
   */
  unregisterGlobalShortcut(accelerator: string): void;
}
