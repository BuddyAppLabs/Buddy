/**
 * @file 定义了 IPC（进程间通信）调用的标准响应结构。
 * @description 这个接口确保了所有在前端（渲染进程）和后端（主进程）之间的异步通信都有一个统一和可预测的返回格式。
 */

/**
 * IPC 响应的基础接口。
 * 泛型 T 代表成功时 'data' 字段的类型。
 * @template T - 成功响应时，data 属性的类型。
 */
export interface IpcResponse<T> {
  /**
   * 指示操作是否成功。
   * `true` 表示操作成功完成，此时 `data` 字段应该被设置。
   * `false` 表示操作失败，此时 `error` 字段应该被设置。
   */
  success: boolean;

  /**
   * 操作失败时的错误信息。
   * 当 `success` 为 `false` 时，此字段应包含一个描述错误的字符串。
   * 当 `success` 为 `true` 时，此字段应为 `undefined`。
   */
  error?: string;

  /**
   * 操作成功时返回的数据。
   * 其类型由泛型 T 定义。
   * 当 `success` 为 `true` 时，此字段应包含操作的结果。
   * 当 `success` 为 `false` 时，此字段应为 `undefined`。
   */
  data?: T;
}
