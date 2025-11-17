/**
 * 系统托盘管理器
 * 负责创建和管理macOS菜单栏图标
 */
import { Tray, Menu, app, nativeImage, NativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { WindowFacade } from '../providers/window/WindowFacade.js';

export class TrayManager {
  private tray: Tray | null = null;

  /**
   * 创建系统托盘
   */
  public createTray(): void {
    try {
      // 检查平台支持
      if (process.platform !== 'darwin') {
        console.log('⚠️ 当前平台不是macOS，跳过托盘创建');
        return;
      }

      // 获取图标
      const icon = this.getIconPath();

      // 创建托盘图标
      this.tray = new Tray(icon);

      // 设置工具提示
      this.tray.setToolTip('Buddy - AI助手');

      // 创建上下文菜单
      this.createContextMenu();

      // 设置点击事件
      this.setupTrayEvents();
    } catch (error) {
      console.error('❌ 创建系统托盘失败:', error);
    }
  }

  /**
   * 获取图标路径并创建适合托盘的图标
   */
  private getIconPath(): NativeImage {
    // 在开发环境和生产环境中使用不同的路径
    const isDev = !app.isPackaged;

    let iconPath: string;
    if (isDev) {
      // 开发环境：从resources文件夹获取，优先使用托盘专用图标
      const trayIconPath = path.join(process.cwd(), '/resources/tray.png');
      const defaultIconPath = path.join(
        process.cwd(),
        'buddy/resources/icon.png'
      );
      iconPath = fs.existsSync(trayIconPath) ? trayIconPath : defaultIconPath;
    } else {
      // 生产环境：从应用资源目录获取
      // 首先尝试从 resources 目录获取
      iconPath = path.join(process.resourcesPath, 'resources', 'tray.png');

      // 如果找不到，尝试直接从 resourcesPath 获取
      if (!fs.existsSync(iconPath)) {
        iconPath = path.join(process.resourcesPath, 'tray.png');
      }

      // 如果还是找不到，尝试从 app.getAppPath 获取
      if (!fs.existsSync(iconPath)) {
        iconPath = path.join(app.getAppPath(), 'resources', 'tray.png');
      }
    }

    // 创建适合托盘的图标
    const image = nativeImage.createFromPath(iconPath);

    if (image.isEmpty()) {
      console.error('❌ 图标文件为空或无法读取:', iconPath);
      // 创建一个简单的默认图标
      return this.createDefaultIcon();
    }

    return image;
  }

  /**
   * 创建默认图标（当找不到图标文件时使用）
   */
  private createDefaultIcon(): NativeImage {
    // 创建一个简单的16x16像素的黑色方块图标
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4); // RGBA

    // 填充为黑色
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 0; // R
      buffer[i + 1] = 0; // G
      buffer[i + 2] = 0; // B
      buffer[i + 3] = 255; // A
    }

    const image = nativeImage.createFromBuffer(buffer, {
      width: size,
      height: size,
    });
    image.setTemplateImage(true);

    return image;
  }

  /**
   * 创建上下文菜单
   */
  private createContextMenu(): void {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示/隐藏窗口',
        click: () => {
          this.toggleMainWindow();
        },
      },
      {
        type: 'separator',
      },
      {
        label: '关于 Buddy',
        click: () => {
          // 可以在这里添加关于对话框
          console.log('显示关于对话框');
        },
      },
      {
        type: 'separator',
      },
      {
        label: '退出',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  /**
   * 设置托盘事件
   */
  private setupTrayEvents(): void {
    if (!this.tray) return;

    // 左键点击事件
    this.tray.on('click', () => {
      this.toggleMainWindow();
    });

    // 右键点击事件（显示上下文菜单）
    this.tray.on('right-click', () => {
      // 上下文菜单会自动显示，这里可以添加额外逻辑
    });
  }

  /**
   * 切换主窗口显示/隐藏
   */
  private toggleMainWindow(): void {
    const mainWindow = WindowFacade.getMainWindow();

    if (!mainWindow) {
      // 如果窗口不存在，创建新窗口
      WindowFacade.createWindow();
      return;
    }

    if (mainWindow.isVisible()) {
      // 如果窗口可见，隐藏它
      mainWindow.hide();
    } else {
      // 如果窗口隐藏，显示并聚焦
      mainWindow.show();
      mainWindow.focus();
    }
  }

  /**
   * 更新托盘图标
   */
  public updateIcon(icon: NativeImage | string): void {
    if (this.tray) {
      this.tray.setImage(icon);
    }
  }

  /**
   * 更新工具提示
   */
  public updateToolTip(tooltip: string): void {
    if (this.tray) {
      this.tray.setToolTip(tooltip);
    }
  }

  /**
   * 销毁托盘
   */
  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  /**
   * 获取托盘实例
   */
  public getTray(): Tray | null {
    return this.tray;
  }
}

// 导出单例实例
export const trayManager = new TrayManager();
