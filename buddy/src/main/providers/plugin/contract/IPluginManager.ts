/**
 * 插件系统相关契约
 */

import { ExecuteResult, SuperAction } from '@coffic/buddy-types';
import { PluginEntity } from '../model/PluginEntity.js';

/**
 * 插件管理器契约
 */
export interface IPluginManager {
  /**
   * 获取所有插件
   */
  getPlugins(): Promise<PluginEntity[]>;

  /**
   * 获取指定插件
   * @param id 插件ID
   */
  getPlugin(id: string): Promise<PluginEntity | null>;

  /**
   * 获取插件动作
   * @param keyword 关键词
   */
  getActions(keyword: string): Promise<SuperAction[]>;

  /**
   * 执行插件动作
   * @param actionId 动作ID
   * @param keyword 关键词
   */
  executeAction(actionId: string, keyword: string): Promise<ExecuteResult>;

  /**
   * 初始化插件系统
   */
  initialize(): Promise<void>;

  /**
   * 获取动作视图
   * @param actionId 动作ID
   */
  getActionView(actionId: string): Promise<string>;

  /**
   * 清理资源
   */
  cleanup(): void;
}
