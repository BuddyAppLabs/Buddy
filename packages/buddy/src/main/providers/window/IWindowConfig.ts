/**
 * 窗口模式类型
 */
export type WindowMode = 'compact' | 'full';

/**
 * 窗口模式配置
 */
export interface WindowModeConfig {
  width: number;
  height: number;
  hideOnBlur: boolean; // 失焦时是否隐藏
  frame: boolean; // 是否显示窗口边框（红绿灯）
  transparent: boolean; // 是否透明
  alwaysOnTop: boolean; // 是否置顶
  opacity: number; // 不透明度
}

/**
 * 窗口配置接口
 */
export interface IWindowConfig {
  showTrafficLights: boolean;
  showDebugToolbar: boolean;
  debugToolbarPosition: 'bottom' | 'right' | 'left' | 'undocked' | 'detach';
  hotkey: string;
  
  // 精简模式配置（快捷键呼出）
  compactMode: WindowModeConfig;
  
  // 完整模式配置（Dock 点击）
  fullMode: WindowModeConfig;
  
  // 兼容旧配置
  size?: {
    width: number;
    height: number;
  };
  
  alwaysOnTop: boolean;
  opacity: number;
  currentMode?: WindowMode; // 当前模式
}
