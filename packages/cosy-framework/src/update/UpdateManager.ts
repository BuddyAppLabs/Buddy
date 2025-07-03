import pkg, { UpdateCheckResult } from 'electron-updater';
const { autoUpdater } = pkg;
import { dialog } from 'electron';
import { IUpdateConfig } from './IUpdateConfig.js';
import { IApplication } from '../contract/IApplication.js';
import { ConfigManager } from '../config/types.js';
import { IUpdateManager } from './IUpdateManager.js';
import { ILogLevel } from '../contract/logger/ILogLevel.js';
import { ILogManager } from '../contract/logger/ILogManager.js';

export class UpdateManager implements IUpdateManager {
  private mainWindow: Electron.BrowserWindow | null = null;

  constructor(
    private readonly app: IApplication,
    private readonly config: ConfigManager,
    private readonly logger: ILogManager
  ) {}

  public boot(): void {
    // We need a better way to get the main window.
    // This is a temporary solution.
    this.app.on('app:window-created', (window: Electron.BrowserWindow) => {
      this.mainWindow = window;
    });

    const updaterConfig = this.config.get<IUpdateConfig>('updater', {
      allowDowngrade: true,
      allowPrerelease: true,
      forceDevUpdateConfig: false,
      autoCheck: true,
      autoCheckDelay: 3000,
    });
    autoUpdater.logger = this.logger.createChannel('update', {
      driver: 'file',
      level: ILogLevel.INFO,
      format: 'structured',
      includeTimestamp: false,
    });
    autoUpdater.allowDowngrade = updaterConfig.allowDowngrade ?? true;
    autoUpdater.allowPrerelease = updaterConfig.allowPrerelease ?? true;

    if (this.app.isDevelopment()) {
      autoUpdater.forceDevUpdateConfig =
        updaterConfig.forceDevUpdateConfig ?? false;
    }

    this.setupEventListeners();

    if (updaterConfig.autoCheck) {
      setTimeout(() => {
        this.checkForUpdates();
      }, updaterConfig.autoCheckDelay || 3000);
    }
  }

  private setupEventListeners(): void {
    autoUpdater.on('error', (error) => {
      this.logger
        .channel('updater')
        .error('Update check failed', { error: error.message });
    });

    autoUpdater.on('checking-for-update', () => {
      this.logger.channel('updater').info('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      this.logger
        .channel('updater')
        .info('Update available.', { version: info.version });
      this.notifyUpdateAvailable(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      this.logger
        .channel('updater')
        .info('Update not available.', { version: info.version });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.logger.channel('updater').debug('Downloading update', {
        percent: progressObj.percent,
        speed: progressObj.bytesPerSecond,
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.logger
        .channel('updater')
        .info('Update downloaded', { version: info.version });
      this.notifyUpdateReady(info);
    });
  }

  private notifyUpdateAvailable(info: any): void {
    if (!this.mainWindow) return;

    dialog
      .showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: `A new version ${info.version} is available.`,
        detail: 'Do you want to download it now?',
        buttons: ['Download', 'Later'],
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  }

  private notifyUpdateReady(info: any): void {
    if (!this.mainWindow) return;

    dialog
      .showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Install Update',
        message: `Version ${info.version} is ready to install.`,
        detail: 'The application will be restarted to install the update.',
        buttons: ['Install Now', 'Later'],
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
  }

  /**
   * 手动检查更新
   * @returns null if the updater is disabled, otherwise info about the latest version
   */
  public async checkForUpdates(): Promise<string> {
    this.logger.channel('updater').info('Manually checking for updates...');

    let result = await autoUpdater.checkForUpdates();
    if (result) {
      return result.updateInfo.version;
    }

    return '更新被禁用';
  }
}
