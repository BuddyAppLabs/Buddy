/**
 * 动作状态
 * - ready: 就绪，可以执行
 * - executing: 执行中
 * - completed: 执行完成
 * - error: 执行出错
 * - disabled: 已禁用
 */
export type ActionStatus =
  | 'ready'
  | 'executing'
  | 'completed'
  | 'error'
  | 'disabled';
