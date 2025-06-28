import { IpcMainInvokeEvent } from 'electron';

/**
 * 路由处理器函数类型
 */
export type IRouteHandler = (
  event: IpcMainInvokeEvent,
  ...args: any[]
) => Promise<any> | any;
