import { SuperAction } from './super-action.js';
import { ActionResult } from './action-result.js';
import { SuperContext } from './super-context.js';
import { PluginType } from './plugin-type.js';

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 插件信息接口
 */
export interface SuperPlugin {
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
   * 插件验证状态
   */
  validation?: ValidationResult | null;

  /**
   * 插件类型
   */
  type: PluginType;

  /**
   * NPM包名称，用于远程插件
   */
  npmPackage?: string;

  /**
   * 插件主页面路径
   */
  pagePath?: string;

  /**
   * 是否为插件视图打开开发者工具
   */
  devTools?: boolean;

  /**
   * 获取动作列表
   */
  getActions(context: SuperContext): Promise<SuperAction[]>;

  /**
   * 执行动作
   */
  executeAction(context: SuperContext): Promise<ActionResult>;
}
