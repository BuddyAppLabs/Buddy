import { dialog } from 'electron';
import { remotePluginDB } from '../providers/plugin/repo/PluginRepoRemote.js';
import { SendablePlugin } from '@/types/sendable-plugin.js';
import { IPC_METHODS } from '@/types/ipc-methods.js';
import { RouteFacade, SettingFacade } from '@coffic/cosy-framework';
import { LogFacade } from '@coffic/cosy-framework';
import { userPluginDB } from '../providers/plugin/repo/UserPluginRepo.js';
import { PluginFacade } from '../providers/plugin/PluginFacade.js';
import {
  SETTING_KEY_PLUGIN_DEV_PACKAGE_PATH,
  SETTING_KEY_PLUGIN_DEV_PATH,
} from '../constants.js';
import { SendablePackage } from '@/types/sendable-package.js';

/**
 * 插件市场路由
 * 处理插件的安装、卸载、查询等功能
 */
export function registerPluginRoutes(): void {
  // 检查插件是否已安装
  RouteFacade.handle(
    IPC_METHODS.Plugin_Is_Installed,
    async (_event, pluginId: string): Promise<boolean> => {
      if (typeof pluginId !== 'string') {
        return false;
      }
      return await userPluginDB.has(pluginId);
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
    })
    .description('检查指定插件是否已安装');

  // 获取用户插件列表
  RouteFacade.handle(
    IPC_METHODS.GET_USER_PLUGINS,
    async (_event): Promise<SendablePlugin[]> => {
      return await userPluginDB.getSendablePlugins();
    }
  ).description('获取用户已安装的插件列表');

  // 获取开发插件列表
  RouteFacade.handle(
    IPC_METHODS.GET_DEV_PLUGINS,
    async (_event): Promise<SendablePlugin[]> => {
      const plugins = await PluginFacade.allDev();
      return await Promise.all(
        plugins.map((plugin) => plugin.getSendablePlugin())
      );
    }
  ).description('获取开发环境的插件列表');

  // 获取开发插件目录
  RouteFacade.handle(
    IPC_METHODS.GET_PLUGIN_DIRECTORIES_REPO,
    (_event): string => {
      return PluginFacade.getDevPluginRootDir();
    }
  ).description('获取开发插件的根目录');

  // 获取开发包目录
  RouteFacade.handle(
    IPC_METHODS.GET_PLUGIN_DIRECTORIES_DEV_PACKAGE,
    (_event): string => {
      return PluginFacade.getDevPackageRootDir();
    }
  ).description('获取开发包的根目录');

  // 设置开发仓库目录
  RouteFacade.handle(
    IPC_METHODS.SET_PLUGIN_DIRECTORIES_REPO,
    async (_event): Promise<string | null> => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'],
      });

      if (canceled || filePaths.length === 0) {
        return null;
      }

      const newPath = filePaths[0];
      SettingFacade.set(SETTING_KEY_PLUGIN_DEV_PATH, newPath);
      PluginFacade.updateDevPluginRootDir(newPath);

      return newPath;
    }
  ).description('设置开发仓库的根目录');

  // 禁用开发仓库
  RouteFacade.handle(
    IPC_METHODS.DISABLE_PLUGIN_DIRECTORIES_REPO,
    (_event): void => {
      PluginFacade.disableDevRepo();
    }
  ).description('禁用开发仓库');

  // 启用开发仓库

  RouteFacade.handle(
    IPC_METHODS.ENABLE_PLUGIN_DIRECTORIES_REPO,
    (_event): void => {
      PluginFacade.enableDevRepo();
    }
  ).description('启用开发仓库');

  // 禁用开发包
  RouteFacade.handle(
    IPC_METHODS.DISABLE_PLUGIN_DIRECTORIES_DEV_PACKAGE,
    (_event): void => {
      PluginFacade.disableDevPackage();
    }
  ).description('禁用开发包');

  // 启用开发包
  RouteFacade.handle(
    IPC_METHODS.ENABLE_PLUGIN_DIRECTORIES_DEV_PACKAGE,
    (_event): void => {
      PluginFacade.enableDevPackage();
    }
  ).description('启用开发包');

  // 重置开发仓库目录
  RouteFacade.handle(
    IPC_METHODS.RESET_PLUGIN_DIRECTORIES_REPO,
    (_event): void => {
      SettingFacade.set(SETTING_KEY_PLUGIN_DEV_PATH, '');
      PluginFacade.updateDevPluginRootDir('');
    }
  ).description('重置开发仓库的根目录');

  // 重置开发包目录
  RouteFacade.handle(
    IPC_METHODS.RESET_PLUGIN_DIRECTORIES_DEV_PACKAGE,
    (_event): void => {
      SettingFacade.set(SETTING_KEY_PLUGIN_DEV_PACKAGE_PATH, '');
      PluginFacade.updateDevPackageRootDir('');
    }
  ).description('重置开发包的根目录');

  // 获取开发包
  RouteFacade.handle(
    IPC_METHODS.GET_DEV_PACKAGE,
    async (_event): Promise<SendablePlugin | null | undefined> => {
      const plugin = await PluginFacade.getDevPackage();
      const sendablePlugin = await plugin?.getSendablePlugin();
      return sendablePlugin;
    }
  ).description('获取开发包');

  // 设置开发包目录
  RouteFacade.handle(
    IPC_METHODS.SET_PLUGIN_DIRECTORIES_DEV_PACKAGE,
    async (_event): Promise<string | null> => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'],
      });

      if (canceled || filePaths.length === 0) {
        return null;
      }

      const newPath = filePaths[0];
      SettingFacade.set(SETTING_KEY_PLUGIN_DEV_PACKAGE_PATH, newPath);
      PluginFacade.updateDevPackageRootDir(newPath);

      return newPath;
    }
  )
    .description('设置开发包的根目录')
    .validation({});

  // 获取远程插件包列表
  RouteFacade.handle(
    IPC_METHODS.GET_REMOTE_PACKAGES,
    async (_event): Promise<SendablePackage[]> => {
      LogFacade.channel('plugin').info('[PluginRoute] 获取远程插件包列表');
      return await remotePluginDB.getSendablePackages();
    }
  ).description('获取远程可下载的插件列表');

  // 下载/安装插件
  RouteFacade.handle(
    IPC_METHODS.DOWNLOAD_PLUGIN,
    async (_event, pluginId: string): Promise<void> => {
      await PluginFacade.install(pluginId);
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
    })
    .description('下载并安装指定的插件');

  // 获取用户插件目录路径
  RouteFacade.handle(
    IPC_METHODS.GET_PLUGIN_DIRECTORIES_USER,
    (_event): string => {
      return userPluginDB.getRootDir();
    }
  ).description('获取用户插件存储目录路径');

  // 卸载插件
  RouteFacade.handle(
    IPC_METHODS.UNINSTALL_PLUGIN,
    async (_event, pluginId: string): Promise<void> => {
      await PluginFacade.uninstall(pluginId);
    }
  )
    .validation({
      '0': { required: true, type: 'string' },
    })
    .description('卸载指定的插件');
}
