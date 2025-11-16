import { BrowserWindow } from 'electron';
import { IWindowConfig, WindowMode } from './IWindowConfig';

/**
 * 窗口管理器接口
 */
export interface IWindowManager {
  /**
   * 创建主窗口
   */
  createWindow(): BrowserWindow;

  /**
   * 获取主窗口实例
   */
  getMainWindow(): BrowserWindow | null;

  /**
   * 切换主窗口显示状态（快捷键触发，使用精简模式）
   */
  toggleMainWindow(): void;

  /**
   * 显示完整窗口（Dock 点击触发）
   */
  showFullWindow(): void;

  /**
   * 切换窗口模式
   */
  switchMode(mode: WindowMode): void;

  /**
   * 获取当前窗口模式
   */
  getCurrentMode(): WindowMode;

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
  getAllWindows(): BrowserWindow[];

  /**
   * 清理资源
   */
  cleanup(): void;
}
