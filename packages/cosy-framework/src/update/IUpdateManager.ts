import { UpdateCheckResult } from 'electron-updater';

export interface IUpdateManager {
  /**
   * 手动检查更新
   */
  checkForUpdates(): Promise<string>;
}
