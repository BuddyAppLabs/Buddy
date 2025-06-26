/**
 * Route 门面
 * 为路由服务提供优雅的静态访问接口
 */

import { Facade } from '../../facades/Facade.js';
import { ContractRouter } from '../types.js';

export class RouteFacade extends Facade {
    protected static override getFacadeAccessor(): string {
        return 'router';
    }

    static get router(): ContractRouter {
        return this.getFacadeRoot() as ContractRouter;
    }
}