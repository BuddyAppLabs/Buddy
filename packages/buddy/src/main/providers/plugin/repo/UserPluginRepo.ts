import { app } from 'electron';
import { join } from 'path';
import { BasePluginRepo } from './BasePluginRepo.js';
import { PluginType } from '@coffic/buddy-it';

/**
 * 用户插件仓库
 * 负责从用户数据目录读取插件信息
 */
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
   * 获取插件类型
   */
  public getPluginType(): PluginType {
    return 'user';
  }
}

// 导出单例
export const userPluginDB = UserPluginRepo.getInstance();
