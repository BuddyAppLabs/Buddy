/**
 * 插件系统相关契约
 */

import { ExecuteResult } from '@coffic/buddy-types';
import { PluginEntity } from '../PluginEntity.js';

/**
 * 插件管理器契约
 */
export interface PluginContract {
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
   * 清理资源
   */
  cleanup(): void;
}
