/**
 * 窗口管理器外观类
 * 提供对窗口管理器的静态访问方法
 */
import { BaseFacade, createFacade } from '@coffic/cosy-framework';
import { WindowManagerContract } from '../../../../packages/cosy-foundation/dist/index.js';

class WindowFacade extends BaseFacade {
    /**
     * 获取服务名称
     */
    public getFacadeAccessor(): string {
        return 'window.manager';
    }
}

// 导出门面代理
export const Window = createFacade<WindowManagerContract>(WindowFacade); 