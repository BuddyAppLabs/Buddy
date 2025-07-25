import { IPC_METHODS } from '@/types/ipc-methods.js';

const ipc = window.ipc;

export const fileIpc = {
  async openFolder(folder: string): Promise<unknown> {
    const response = await ipc.invoke(IPC_METHODS.OPEN_FOLDER, folder);

    console.log('response', response);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  },
};
