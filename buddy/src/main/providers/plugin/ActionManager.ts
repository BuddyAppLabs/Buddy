/**
 * 插件动作管理器
 * 负责管理和执行插件动作
 */
import { BaseManager } from '../../managers/BaseManager.js';
import { ActionEntity } from './ActionEntity.js';
import { LogFacade } from '@coffic/cosy-logger';
import { PluginManager } from './PluginManager.js';

const verbose = true;

class ActionManager extends BaseManager {
  private static instance: ActionManager;

  private constructor() {
    super({
      name: 'PluginActionManager',
      enableLogging: true,
      logLevel: 'info',
    });
  }

  /**
   * 获取 ActionManager 实例
   */
  public static getInstance(): ActionManager {
    if (!ActionManager.instance) {
      ActionManager.instance = new ActionManager();
    }
    return ActionManager.instance;
  }

  /**
   * 获取插件动作
   * @param keyword 搜索关键词
   * @returns 匹配的插件动作列表
   */
  async getActions(keyword: string = ''): Promise<ActionEntity[]> {
    let allActions: ActionEntity[] = [];
    let pluginManager = new PluginManager();

    try {
      // 从所有加载的插件中获取动作
      const plugins = await pluginManager.getPlugins();
      for (const plugin of plugins) {
        if (verbose) {
          LogFacade.channel('action').debug(
            `[ActionManager] 获取插件动作: ${plugin.id}`
          );
        }

        try {
          const pluginActions = await plugin.getActions(keyword);
          allActions = [...allActions, ...pluginActions];
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

          // 记录错误但继续处理其他插件
          this.handleError(
            error,
            `获取插件 ${plugin.id} 的动作失败，但不影响其他插件`
          );
        }
      }

      // logger.info(`获取插件动作，所有动作`, allActions);

      if (verbose) {
        LogFacade.channel('action').info(
          `[ActionManager] 找到 ${allActions.length} 个动作`
        );
      }
      return allActions;
    } catch (error) {
      this.handleError(error, '获取插件动作失败');
      return [];
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
   * 清理资源
   */
  public cleanup(): void {
    LogFacade.channel('action').info('[ActionManager] 清理动作管理器资源');
    try {
      // 移除所有事件监听器
      this.removeAllListeners();
      LogFacade.channel('action').info(
        '[ActionManager] 动作管理器资源清理完成'
      );
    } catch (error) {
      this.handleError(error, '清理动作管理器资源失败');
    }
  }
}

// 导出单例
export const actionManager = ActionManager.getInstance();
