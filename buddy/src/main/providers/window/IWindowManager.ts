import { IWindowConfig } from './IWindowConfig';

/**
 * 窗口管理器接口
 */
export interface IWindowManager {
  /**
   * 创建主窗口
   */
  createWindow(): Electron.BrowserWindow;

  /**
   * 获取主窗口实例
   */
  getMainWindow(): Electron.BrowserWindow | null;

  /**
   * 切换主窗口显示状态
   */
  toggleMainWindow(): void;

  /**
   * 设置全局快捷键
   */
  setupGlobalShortcut(): void;

  /**
   * 更新窗口配置
   */
  updateConfig(newConfig: Partial<IWindowConfig>): void;

  /**
   * 获取所有窗口
   */
  getAllWindows(): Electron.BrowserWindow[];

  /**
   * 清理资源
   */
  cleanup(): void;
}
