import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import { dialog } from 'electron';
import { IUpdateManager, UpdateConfig } from './contracts/UpdateContract.js';
import { IApplication } from '../application/Application.js';
import { ConfigManager } from '../config/types.js';
import { LogManagerContract } from '../contracts/logger/index.js';

export class UpdateManager implements IUpdateManager {
  private mainWindow: Electron.BrowserWindow | null = null;

  constructor(
    private readonly app: IApplication,
    private readonly config: ConfigManager,
    private readonly logger: LogManagerContract
  ) {}

  public boot(): void {
    // We need a better way to get the main window.
    // This is a temporary solution.
    this.app.on('app:window-created', (window: Electron.BrowserWindow) => {
      this.mainWindow = window;
    });

    const updaterConfig = this.config.get<UpdateConfig>('updater', {});
    autoUpdater.logger = this.logger.channel('updater');
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

  public checkForUpdates(): void {
    this.logger.channel('updater').info('Manually checking for updates...');
    autoUpdater.checkForUpdates().catch((error) => {
      this.logger
        .channel('updater')
        .error('Failed to check for updates', { error: error.message });
    });
  }
}
