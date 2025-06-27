/**
 * 用户插件仓库
 * 负责从用户数据目录读取插件信息
 */
import { app } from 'electron';
import { join } from 'path';
import { BasePluginRepo } from './BasePluginRepo.js';
import { PluginType } from '@coffic/buddy-types';

export class UserPluginRepo extends BasePluginRepo {
  private static instance: UserPluginRepo;

  private constructor() {
    const userDataPath = app.getPath('userData');
    super(join(userDataPath, 'plugins'));
  }

  /**
   * 获取实例
   */
  public static getInstance(): UserPluginRepo {
    if (!UserPluginRepo.instance) {
      UserPluginRepo.instance = new UserPluginRepo();
    }
    return UserPluginRepo.instance;
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
    return 'user';
  }
}

// 导出单例
export const userPluginDB = UserPluginRepo.getInstance();
