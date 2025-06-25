/**
 * 插件市场门面
 * 提供了一个简单的静态接口来访问插件市场功能
 */
import { BaseFacade } from '@coffic/cosy';

class MarketFacade extends BaseFacade {
    public getFacadeAccessor(): string {
        return 'market';
    }
}

export const Market = MarketFacade; 