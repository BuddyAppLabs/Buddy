/**
 * 窗口管理器的契约接口
 * 定义了窗口管理相关的核心功能
 */
import { BrowserWindow } from 'electron';

/**
 * 窗口配置接口
 */
export interface WindowConfig {
  showTrafficLights: boolean;
  showDebugToolbar: boolean;
  debugToolbarPosition: 'bottom' | 'right' | 'left' | 'undocked' | 'detach';
  hotkey: string;
  size: {
    width: number;
    height: number;
  };
  alwaysOnTop: boolean;
  opacity: number;
}

/**
 * 窗口管理器契约
 */
export interface ContractWindow {
  /**
   * 获取主窗口实例
   */
  getMainWindow(): BrowserWindow | null;

  /**
   * 创建主窗口
   */
  createWindow(): BrowserWindow;

  /**
   * 显示或隐藏主窗口
   */
  toggleMainWindow(): void;

  /**
   * 设置全局快捷键
   */
  setupGlobalShortcut(): void;

  /**
   * 清理资源
   */
  cleanup(): void;
}

/**
 * 窗口管理器工厂契约
 */
export interface ContractWindowFactory {
  /**
   * 创建窗口管理器实例
   */
  createManager(config: WindowConfig): ContractWindow;
}

/**
 * 窗口管理器接口
 */
export interface WindowManagerContract {
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
  updateConfig(newConfig: Partial<WindowConfig>): void;

  /**
   * 获取所有窗口
   */
  getAllWindows(): Electron.BrowserWindow[];

  /**
   * 清理资源
   */
  cleanup(): void;
}
