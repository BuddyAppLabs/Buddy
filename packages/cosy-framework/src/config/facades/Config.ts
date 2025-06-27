/**
 * Buddy Foundation 配置门面
 * 提供Laravel风格的静态配置访问接口
 */

import { ConfigManager, ConfigValue, ConfigObject } from '../types.js';

export class Config {
    /** 配置管理器实例 */
    private static manager: ConfigManager | null = null;

    /**
     * 设置配置管理器实例
     * @param manager 配置管理器
     */
    static setManager(manager: ConfigManager): void {
        Config.manager = manager;
    }

    /**
     * 获取配置管理器实例
     */
    static getManager(): ConfigManager {
        if (!Config.manager) {
            throw new Error('配置管理器尚未设置，请先调用 Config.setManager()');
        }
        return Config.manager;
    }

    /**
     * 获取配置值
     * @param key 配置键，支持点记法
     * @param defaultValue 默认值
     */
    static get<T = ConfigValue>(key: string, defaultValue?: T): T {
        return Config.getManager().get(key, defaultValue);
    }

    /**
     * 设置配置值
     * @param key 配置键，支持点记法
     * @param value 配置值
     */
    static set(key: string, value: ConfigValue): void {
        Config.getManager().set(key, value);
    }

    /**
     * 检查配置是否存在
     * @param key 配置键
     */
    static has(key: string): boolean {
        return Config.getManager().has(key);
    }

    /**
     * 获取所有配置
     */
    static all(): ConfigObject {
        return Config.getManager().all();
    }

    /**
     * 合并配置
     * @param config 要合并的配置对象
     */
    static merge(config: ConfigObject): void {
        Config.getManager().merge(config);
    }

    /**
     * 观察配置变化
     * @param key 配置键
     * @param callback 变化回调
     * @returns 取消观察的函数
     */
    static watch(key: string, callback: (newValue: ConfigValue, oldValue: ConfigValue) => void): () => void {
        return Config.getManager().watch(key, callback);
    }

    /**
     * 删除配置项
     * @param key 配置键
     */
    static forget(key: string): void {
        Config.getManager().forget(key);
    }

    /**
     * 获取配置的某个分支
     * @param prefix 前缀
     */
    static getConfig(prefix: string): ConfigObject {
        return Config.getManager().getConfig(prefix);
    }

    /**
     * 重新加载配置
     */
    static async reload(): Promise<void> {
        await Config.getManager().reload();
    }

    /**
     * 检查配置系统是否已初始化
     */
    static isInitialized(): boolean {
        return Config.manager?.isInitialized() ?? false;
    }

    /**
     * 获取配置系统状态
     */
    static getStatus() {
        return Config.getManager().getStatus();
    }

    /**
     * 缓存当前配置
     */
    static async cache(): Promise<void> {
        await Config.getManager().cacheConfig();
    }

    /**
     * 清除配置缓存
     */
    static async clearCache(): Promise<void> {
        await Config.getManager().clearCache();
    }
} 