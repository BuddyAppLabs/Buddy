/**
 * 插件门面
 * 使用框架包的门面系统
 * 提供简洁的插件 API 访问
 */
import { BaseFacade, createFacade } from '@coffic/electron-laravel-framework';

export interface PluginManagerInterface {
    getPlugins(): Promise<any[]>;
    getPlugin(id: string): Promise<any | null>;
    executeAction(actionId: string, keyword: string): Promise<any>;
    initialize(): Promise<void>;
    cleanup(): void;
}

class PluginFacade extends BaseFacade {
    public getFacadeAccessor(): string {
        return 'plugin.manager';
    }
}

// 导出门面代理
export const Plugin = createFacade<PluginManagerInterface>(PluginFacade); 