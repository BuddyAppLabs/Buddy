/**
 * 插件管理器
 * 负责插件的加载、管理和通信
 */
import { PluginContract } from './contracts/PluginContract.js';
import { PluginEntity } from './entities/PluginEntity.js';
import { userPluginDB } from './repo/UserPluginRepo.js';
import { devPluginDB } from './repo/DevPluginRepo.js';

export class PluginManager implements PluginContract {
    /**
     * 初始化插件系统
     */
    public async initialize(): Promise<void> {
        try {
            await userPluginDB.ensureRepoDirs();
        } catch (error) {
            console.error('插件系统初始化失败', error);
            throw error;
        }
    }

    /**
     * 获取所有插件
     */
    public async getPlugins(): Promise<PluginEntity[]> {
        return [
            ...await userPluginDB.getAllPlugins(),
            ...await devPluginDB.getAllPlugins()
        ];
    }

    /**
     * 获取指定插件
     * @param id 插件ID
     */
    public async getPlugin(id: string): Promise<PluginEntity | null> {
        return await userPluginDB.find(id) || await devPluginDB.find(id);
    }

    /**
     * 执行插件动作
     * @param actionId 动作ID
     * @param keyword 关键词
     */
    public async executeAction(actionId: string, keyword: string): Promise<any> {
        const [pluginId, actionLocalId] = actionId.split(':');
        const plugin = await this.getPlugin(pluginId);
        if (!plugin) {
            throw new Error(`插件不存在: ${pluginId}`);
        }

        return plugin.executeAction(actionLocalId, keyword);
    }

    /**
     * 清理资源
     */
    public cleanup(): void {
        // 清理资源，如事件监听器等
    }
} 