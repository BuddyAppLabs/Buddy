import { Facade } from '@coffic/cosy-framework';
import { createFacade } from '@coffic/cosy-framework';
import { IWindowManager } from './IWindowManager.js';

/**
 * 路由门面基类
 */
class BaseFacade extends Facade {
  protected static getFacadeAccessor(): string {
    return 'window.manager';
  }
}

// 创建并导出类型安全的路由门面
export const WindowFacade = createFacade<IWindowManager>(BaseFacade);
