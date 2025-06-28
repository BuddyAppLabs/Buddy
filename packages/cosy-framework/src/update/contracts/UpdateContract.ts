export const UpdateContract = 'update';

export interface IUpdateManager {
  /**
   * 手动检查更新
   */
  checkForUpdates(): void;
}

export interface UpdateConfig {
  allowDowngrade?: boolean;
  allowPrerelease?: boolean;
  forceDevUpdateConfig?: boolean;
  autoCheck?: boolean;
  autoCheckDelay?: number;
}
