/**
 * 插件系统相关契约
 */

import { ExecuteResult, GetActionsArgs } from '@coffic/buddy-types';
import { PluginEntity } from '../model/PluginEntity.js';
import { ActionEntity } from '../model/ActionEntity.js';
import { SendablePlugin } from '@/types/sendable-plugin.js';

/**
 * 插件管理器契约
 */
export interface IPluginManager {
  /**
   * 获取所有插件
   */
  all(): Promise<PluginEntity[]>;

  /**
   * 获取所有开发插件
   */
  allDev(): Promise<PluginEntity[]>;

  /**
   * 获取指定插件
   * @param id 插件ID
   */
  find(id: string): Promise<PluginEntity | null>;

  /**
   * 获取插件动作
   * @param keyword 关键词
   */
  actions(args: GetActionsArgs): Promise<ActionEntity[]>;

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
   * 获取动作视图的HTML内容
   * @param actionId 动作ID
   */
  getActionView(actionId: string): Promise<string>;

  /**
   * 安装插件
   * @param packageName 包名
   */
  install(packageName: string): Promise<void>;

  /**
   * 卸载插件
   * @param packageName 包名
   */
  uninstall(packageName: string): Promise<void>;

  /**
   * 获取开发插件的根目录
   */
  getDevPluginRootDir(): string;

  /**
   * 获取开发包的根目录
   */
  getDevPackageRootDir(): string;

  /**
   * 获取开发包
   */
  getDevPackage(): Promise<PluginEntity | null>;

  /**
   * 更新开发插件的根目录
   */
  updateDevPluginRootDir(path: string): void;

  /**
   * 更新开发包的根目录
   */
  updateDevPackageRootDir(path: string): void;
}
