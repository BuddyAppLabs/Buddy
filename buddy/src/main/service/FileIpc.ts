import { shell } from 'electron';
import { Config } from '@coffic/cosy-framework';
import path from 'path';

class FileIpc {
  /**
   * 打开配置文件夹
   */
  async openConfigFolder(): Promise<void> {
    const configPath = Config.get('paths.config');
    if (!configPath || typeof configPath !== 'string') {
      throw new Error('配置路径未设置或类型错误');
    }
    await shell.openPath(path.resolve(configPath));
  }
}

export const fileIpc = new FileIpc();
