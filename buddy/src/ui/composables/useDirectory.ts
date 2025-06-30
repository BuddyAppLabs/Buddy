import { fileIpc } from '@ipc/file-ipc';

export function useDirectory() {
  const openDirectory = async (dir: string) => {
    if (!dir) {
      throw new Error('目录不能为空');
    }

    try {
      await fileIpc.openFolder(dir);
    } catch (error) {
      console.error(`打开目录失败: ${error}`);
    }
  };

  return {
    openDirectory,
  };
}
