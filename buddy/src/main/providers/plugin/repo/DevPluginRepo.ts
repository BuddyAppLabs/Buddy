/**
 * 开发插件仓库
 * 负责从开发目录读取插件信息
 */
import { BasePluginRepo } from './BasePluginRepo.js';
import { PluginType } from '@coffic/buddy-types';

export class DevPluginRepo extends BasePluginRepo {
  private enabled: boolean = true;

  constructor(dir: string | null) {
    // 如果没有提供目录，则使用一个不会加载任何内容的假路径
    super(dir ?? '');
    if (!dir) {
      this.enabled = false;
    }
  }

  public async getAllPlugins() {
    if (!this.enabled) {
      return [];
    }
    return await super.getAllPlugins();
  }

  /**
   * 更新仓库的根目录
   * @param newPath 新的根目录路径
   */
  public updatePath(newPath: string): void {
    this.rootDir = newPath;
    this.enabled = true; // 确保仓库是启用的
  }

  /**
   * 从目录加载插件
   */
  protected async loadPluginFromDir(_pluginPath: string): Promise<any | null> {
    // 这里需要主项目提供具体的插件加载逻辑
    return null;
  }

  /**
   * 转换为可发送的插件格式
   */
  protected async toSendablePlugin(plugin: any): Promise<any> {
    // 这里需要主项目提供具体的转换逻辑
    return plugin;
  }

  /**
   * 获取插件类型
   */
  public getPluginType(): PluginType {
    return 'dev';
  }
}
