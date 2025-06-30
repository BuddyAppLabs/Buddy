import { createFacade, Facade } from '@coffic/cosy-framework';
import { IPluginManager } from './contract/IPluginManager.js';

class BaseFacade extends Facade {
  protected static override getFacadeAccessor(): string {
    return 'plugin';
  }
}

// 创建并导出类型安全的门面
export const PluginFacade = createFacade<IPluginManager>(BaseFacade);
