import { IpcMainInvokeEvent } from 'electron';

/**
 * 中间件函数类型
 */
export type IMiddleware = (
  event: IpcMainInvokeEvent | any, // Can be a generic request or an IPC event
  next: () => Promise<any>,
  channel: string,
  ...args: any[]
) => Promise<any> | any;
