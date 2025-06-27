import { IpcResponse } from '@coffic/buddy-types';
import { SendableAction } from '@/types/sendable-action.js';
import { logger } from '@utils/logger';
import { IPC_METHODS } from '@/types/ipc-methods';
const ipc = window.ipc;

export const actionIpc = {
  async getActions(keyword = ''): Promise<SendableAction[]> {
    const response: IpcResponse<SendableAction[]> = await ipc.invoke(
      IPC_METHODS.GET_ACTIONS,
      keyword
    );
    if (response.success) {
      return response.data as SendableAction[];
    } else {
      throw new Error(response.error);
    }
  },

  async executeAction(actionId: string, keyword: string) {
    logger.info(`执行插件动作: ${actionId}, 关键词: ${keyword}`);

    const response = await ipc.invoke(
      IPC_METHODS.EXECUTE_PLUGIN_ACTION,
      actionId,
      keyword
    );

    if (!response.success) {
      throw new Error(response.error);
    }

    return response.data;
  },

  async getActionView(actionId: string): Promise<string> {
    const response = await ipc.invoke(IPC_METHODS.GET_ACTION_VIEW, actionId);
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },
};
