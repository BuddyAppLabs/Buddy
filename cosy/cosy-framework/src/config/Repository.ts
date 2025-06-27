/**
 * Buddy Foundation 配置仓库
 * 实现配置的存储、访问和观察功能
 */

import { ConfigRepository, ConfigValue, ConfigObject, ConfigWatcher } from './types.js';
import { get, set, has, mergeConfig, cloneConfig } from './utils.js';

export class Repository implements ConfigRepository {
    /** 配置数据 */
    private config: ConfigObject = {};

    /** 配置观察者列表 */
    private watchers: ConfigWatcher[] = [];

    constructor(initialConfig: ConfigObject = {}) {
        this.config = cloneConfig(initialConfig);
    }

    /**
     * 获取配置值
     * @param key 配置键，支持点记法
     * @param defaultValue 默认值
     */
    get<T = ConfigValue>(key: string, defaultValue?: T): T {
        return get(this.config, key, defaultValue);
    }

    /**
     * 设置配置值
     * @param key 配置键，支持点记法
     * @param value 配置值
     */
    set(key: string, value: ConfigValue): void {
        const oldValue = this.get(key);
        set(this.config, key, value);

        // 触发观察者
        this.notifyWatchers(key, value, oldValue);
    }

    /**
     * 检查配置是否存在
     * @param key 配置键
     */
    has(key: string): boolean {
        return has(this.config, key);
    }

    /**
     * 获取所有配置
     */
    all(): ConfigObject {
        return cloneConfig(this.config);
    }

    /**
     * 合并配置
     * @param config 要合并的配置对象
     */
    merge(config: ConfigObject): void {
        const oldConfig = cloneConfig(this.config);
        this.config = mergeConfig(this.config, config);

        // 通知所有相关的观察者
        this.notifyAllWatchers(oldConfig);
    }

    /**
     * 观察配置变化
     * @param key 配置键
     * @param callback 变化回调
     * @returns 取消观察的函数
     */
    watch(key: string, callback: (newValue: ConfigValue, oldValue: ConfigValue) => void): () => void {
        const watcher: ConfigWatcher = { key, callback };
        this.watchers.push(watcher);

        // 返回取消观察的函数
        return () => {
            const index = this.watchers.indexOf(watcher);
            if (index > -1) {
                this.watchers.splice(index, 1);
            }
        };
    }

    /**
     * 重置配置
     * @param config 新的配置对象
     */
    reset(config: ConfigObject = {}): void {
        const oldConfig = cloneConfig(this.config);
        this.config = cloneConfig(config);

        // 通知所有观察者
        this.notifyAllWatchers(oldConfig);
    }

    /**
     * 删除配置项
     * @param key 配置键
     */
    forget(key: string): void {
        const keys = key.split('.');
        let current: any = this.config;

        // 找到父对象
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current || typeof current !== 'object') {
                return; // 路径不存在
            }
            current = current[keys[i]];
        }

        if (current && typeof current === 'object') {
            const oldValue = current[keys[keys.length - 1]];
            delete current[keys[keys.length - 1]];

            // 触发观察者
            this.notifyWatchers(key, undefined, oldValue);
        }
    }

    /**
     * 获取配置的某个分支
     * @param prefix 前缀
     */
    getConfig(prefix: string): ConfigObject {
        const value = this.get(prefix);
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return value as ConfigObject;
        }
        return {};
    }

    /**
     * 通知指定键的观察者
     * @param key 配置键
     * @param newValue 新值
     * @param oldValue 旧值
     */
    private notifyWatchers(key: string, newValue: ConfigValue, oldValue: ConfigValue): void {
        // 完全匹配的观察者
        const exactWatchers = this.watchers.filter(w => w.key === key);
        exactWatchers.forEach(watcher => {
            try {
                watcher.callback(newValue, oldValue);
            } catch (error) {
                console.error(`配置观察者执行失败 [${key}]:`, error);
            }
        });

        // 前缀匹配的观察者（监听父级配置的观察者也应该被通知）
        const prefixWatchers = this.watchers.filter(w =>
            w.key !== key && (key.startsWith(w.key + '.') || w.key.startsWith(key + '.'))
        );

        prefixWatchers.forEach(watcher => {
            try {
                const currentValue = this.get(watcher.key);
                watcher.callback(currentValue, currentValue); // 前缀匹配时，新旧值相同
            } catch (error) {
                console.error(`配置观察者执行失败 [${watcher.key}]:`, error);
            }
        });
    }

    /**
     * 通知所有观察者配置已发生变化
     * @param oldConfig 旧配置
     */
    private notifyAllWatchers(oldConfig: ConfigObject): void {
        this.watchers.forEach(watcher => {
            try {
                const newValue = this.get(watcher.key);
                const oldValue = get(oldConfig, watcher.key);

                // 只有值实际改变时才通知
                if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                    watcher.callback(newValue, oldValue);
                }
            } catch (error) {
                console.error(`配置观察者执行失败 [${watcher.key}]:`, error);
            }
        });
    }

    /**
     * 获取观察者数量（用于调试）
     */
    getWatchersCount(): number {
        return this.watchers.length;
    }

    /**
     * 清除所有观察者
     */
    clearWatchers(): void {
        this.watchers = [];
    }
} 