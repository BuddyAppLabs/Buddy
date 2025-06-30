/**
 * 插件管理器
 * 负责插件的加载、管理和通信
 */
import { IPluginManager } from '../contract/IPluginManager.js';
import { PluginEntity } from '../model/PluginEntity.js';
import { LogFacade } from '@coffic/cosy-logger';
import { DevPluginRepo } from '../repo/DevPluginRepo.js';
import { userPluginDB } from '../repo/UserPluginRepo.js';
import { ActionEntity } from '../model/ActionEntity.js';

export class PluginManager implements IPluginManager {
  /**
   * 构造函数
   * @param repository 插件仓储
   */
  constructor(private readonly devPluginDB: DevPluginRepo) {}

  /**
   * 初始化插件系统
   */
  public async initialize(): Promise<void> {
    try {
      await userPluginDB.ensureRepoDirs();
    } catch (error) {
      console.error('插件系统初始化失败', error);
      throw error;
    }
  }

  /**
   * 获取所有插件
   */
  public async all(): Promise<PluginEntity[]> {
    return [
      ...(await userPluginDB.getAllPlugins()),
      ...(await this.devPluginDB.getAllPlugins()),
    ];
  }

  /**
   * 获取指定插件
   * @param id 插件ID
   */
  public async find(id: string): Promise<PluginEntity | null> {
    return (await userPluginDB.find(id)) || (await this.devPluginDB.find(id));
  }

  /**
   * 执行插件动作
   * @param actionId 动作ID
   * @param keyword 关键词
   */
  public async executeAction(actionId: string, keyword: string): Promise<any> {
    const [pluginId, actionLocalId] = actionId.split(':');
    const plugin = await this.find(pluginId);
    if (!plugin) {
      LogFacade.channel('plugin').error(`[PluginManager] 插件不存在`, {
        pluginId,
        actionId,
        keyword,
      });
      throw new Error(`插件不存在: ${pluginId}`);
    }

    return plugin.executeAction(actionLocalId, keyword);
  }

  /**
   * 获取插件动作
   * @param keyword 搜索关键词
   * @returns 匹配的插件动作列表
   */
  async actions(keyword: string = ''): Promise<ActionEntity[]> {
    let allActions: ActionEntity[] = [];

    try {
      // 从所有加载的插件中获取动作
      const plugins = await this.all();
      for (const plugin of plugins) {
        LogFacade.channel('plugin').debug(
          `[PluginManager] 获取插件动作: ${plugin.id}`
        );

        try {
          const pluginActions: ActionEntity[] =
            await plugin.getActions(keyword);

          // 为每个动作设置插件 ID 和全局 ID
          const processedActions = pluginActions.map((action) => {
            action.pluginId = plugin.id; // 注入插件 ID
            action.globalId = `${plugin.id}:${action.id}`; // 创建全局唯一 ID
            return action;
          });

          allActions = [...allActions, ...processedActions];
        } catch (error) {
          // 获取详细的错误信息
          const errorDetail =
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name,
                }
              : String(error);

          LogFacade.channel('action').error(
            `[ActionManager] 插件 ${plugin.id} 获取动作失败`,
            {
              error: errorDetail,
              pluginInfo: {
                id: plugin.id,
                name: plugin.name,
                version: plugin.version,
                path: plugin.path,
              },
            }
          );

          throw new Error(`获取插件 ${plugin.id} 的动作失败，但不影响其他插件`);
        }
      }

      LogFacade.channel('plugin').info(`[PluginManager] 获取插件动作`, {
        allActions,
      });

      LogFacade.channel('plugin').info(
        `[PluginManager] 找到 ${allActions.length} 个动作`
      );
      return allActions;
    } catch (error) {
      throw new Error(`获取插件动作失败: ${error}`);
    }
  }

  /**
   * 获取动作视图内容
   * @param actionId 动作ID
   * @returns 视图内容
   */
  async getActionView(actionId: string): Promise<string> {
    LogFacade.channel('action').info(
      `[ActionManager] 获取动作视图: ${actionId}`
    );

    return 'action view';
  }

  /**
   * 安装插件
   * @param packageName 包名
   */
  public async install(packageName: string): Promise<void> {
    LogFacade.channel('plugin').info(
      `[PluginManager] 安装插件: ${packageName}`
    );
  }

  /**
   * 卸载插件
   * @param packageName 包名
   */
  public async uninstall(packageName: string): Promise<void> {
    LogFacade.channel('plugin').info(
      `[PluginManager] 卸载插件: ${packageName}`
    );

    const plugin = await this.find(packageName);
    if (!plugin) {
      throw new Error(`插件不存在: ${packageName}`);
    }

    plugin.delete();
  }

  /**
   * 获取开发插件的根目录
   */
  public getDevPluginRootDir(): string {
    return this.devPluginDB.getRootDir();
  }

  /**
   * 更新开发插件的根目录
   * @param path 新路径
   */
  public updateDevPluginRootDir(path: string): void {
    this.devPluginDB.updatePath(path);
  }
}
