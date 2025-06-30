/**
 * 配置相关路由
 * 使用新的配置系统处理应用配置
 */

import { RouteFacade, SettingFacade, Config } from '@coffic/cosy-framework';
import { IPC_METHODS } from '@/types/ipc-methods.js';

const logger = console;

export function registerSettingRoutes(): void {
  // 获取所有配置
  RouteFacade.handle(IPC_METHODS.CONFIG_GET_ALL, async (_event) => {
    try {
      return Config.all();
    } catch (error) {
      logger.error('IPC获取所有配置失败:', error);
      throw error;
    }
  }).description('获取所有配置项');

  // 获取单个配置
  RouteFacade.handle(
    IPC_METHODS.CONFIG_GET,
    async (_event, key: string, defaultValue?: any) => {
      try {
        return Config.get(key, defaultValue);
      } catch (error) {
        logger.error(`IPC获取配置[${key}]失败:`, error);
        throw error;
      }
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
    })
    .description('获取指定配置项的值');

  // 设置配置
  RouteFacade.handle(
    IPC_METHODS.CONFIG_SET,
    async (_event, key: string, value: any) => {
      try {
        Config.set(key, value);
        return true;
      } catch (error) {
        logger.error(`IPC设置配置[${key}]失败:`, error);
        throw error;
      }
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
      '1': { required: true },
    })
    .description('设置指定配置项的值');

  // 删除配置
  RouteFacade.handle(IPC_METHODS.CONFIG_DELETE, async (_event, key: string) => {
    try {
      Config.forget(key);
      return true;
    } catch (error) {
      logger.error(`IPC删除配置[${key}]失败:`, error);
      throw error;
    }
  })
    .validation({
      '0': { required: true, type: 'string' },
    })
    .description('删除指定的配置项');

  // 重新加载配置
  RouteFacade.handle(IPC_METHODS.CONFIG_RESET, async (_event) => {
    try {
      await Config.reload();
      return true;
    } catch (error) {
      logger.error('IPC重新加载配置失败:', error);
      throw error;
    }
  }).description('重新加载配置文件');

  // 获取用户数据文件夹路径
  RouteFacade.handle(
    IPC_METHODS.CONFIG_GET_PATH,
    async (_event): Promise<string> => {
      return SettingFacade.getDirectoryPath();
    }
  ).description('获取用户数据文件夹路径');
}
