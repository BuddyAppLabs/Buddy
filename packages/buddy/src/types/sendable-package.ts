import { PluginType } from './plugin-type.js';

/**
 * 插件包信息接口
 */
export interface SendablePackage {
  /**
   * 插件ID
   */
  id: string;

  /**
   * 插件名称
   */
  name: string;

  /**
   * 插件描述
   */
  description: string;

  /**
   * 插件版本
   */
  version: string;

  /**
   * 插件作者
   */
  author: string;

  /**
   * 插件主入口
   */
  main?: string;

  /**
   * 插件路径
   */
  path: string;

  /**
   * 插件类型
   */
  type: PluginType;

  /**
   * NPM包名称，用于远程插件
   */
  npmPackage?: string;

  /**
   * 插件错误
   */
  error?: string;
}
