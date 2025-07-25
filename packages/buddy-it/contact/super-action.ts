import { ActionResult } from './action-result.js';

/**
 * 动作视图模式
 */
export type ViewMode = 'embedded' | 'window';

/**
 * 插件动作接口
 */
export interface SuperAction {
  /**
   * 在插件的命名空间中的动作ID
   */
  id: string;

  /**
   * 动作描述
   */
  description: string;

  /**
   * 视图路径
   */
  viewPath?: string;

  /**
   * 视图模式
   */
  viewMode?: ViewMode;

  /**
   * 可执行函数
   * @returns 执行结果
   */
  execute?: () => Promise<ActionResult>;
}
