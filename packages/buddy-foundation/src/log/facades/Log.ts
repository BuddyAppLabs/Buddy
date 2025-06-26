

import { createFacade, Facade } from '@coffic/cosy-framework';
import { LogManagerContract } from '../contracts/LogContract.js';

/**
 * 路由门面基类
 */
class BaseFacade extends Facade {
    protected static override getFacadeAccessor(): string {
        return 'log';
    }
}

// 创建并导出类型安全的路由门面
export const LogFacade = createFacade<LogManagerContract>(BaseFacade);