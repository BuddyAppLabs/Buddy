/**
 * 窗口配置接口
 */
export interface IWindowConfig {
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
