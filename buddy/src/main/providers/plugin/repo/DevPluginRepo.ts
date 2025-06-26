/**
 * 开发插件仓库
 * 负责从开发目录读取插件信息
 */
import { dirname, join } from 'path';
import { BasePluginRepo } from './BasePluginRepo.js';

export class DevPluginRepo extends BasePluginRepo {
    private static instance: DevPluginRepo;

    private constructor() {
        const dir = join(dirname(process.cwd()), 'packages');
        super(dir);
    }

    /**
     * 获取实例
     */
    public static getInstance(): DevPluginRepo {
        if (!DevPluginRepo.instance) {
            DevPluginRepo.instance = new DevPluginRepo();
        }
        return DevPluginRepo.instance;
    }

    /**
     * 从目录加载插件
     */
    protected async loadPluginFromDir(pluginPath: string): Promise<any | null> {
        // 这里需要主项目提供具体的插件加载逻辑
        return null;
    }

    /**
     * 转换为可发送的插件格式
     */
    protected async toSendablePlugin(plugin: any): Promise<any> {
        // 这里需要主项目提供具体的转换逻辑
        return plugin;
    }

    /**
     * 获取插件类型
     */
    public getPluginType(): string {
        return 'dev';
    }
}

// 导出单例
export const devPluginDB = DevPluginRepo.getInstance(); 