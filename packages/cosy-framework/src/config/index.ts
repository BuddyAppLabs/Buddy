/**
 * Buddy Foundation 配置系统
 * 提供类似Laravel的配置管理功能
 */

import { Manager } from './Manager.js';
import { Config } from './facades/Config.js';
import { Loader } from './Loader.js';

// 导出核心类型
export * from './types.js';

// 导出工具函数
export * from './utils.js';

// 导出核心类
export { Repository } from './Repository.js';
export { Loader } from './Loader.js';
export { Manager } from './Manager.js';

// 导出门面
export { Config } from './facades/Config.js';

/** 全局配置管理器实例 */
export const configManager = new Manager();

// 设置门面的管理器实例
Config.setManager(configManager);

/**
 * 配置助手函数，类似Laravel的config()函数
 * @param key 配置键，支持点记法
 * @param defaultValue 默认值
 */
export function config<T = any>(key?: string, defaultValue?: T): T {
    if (!key) {
        return configManager.all() as T;
    }
    return configManager.get(key, defaultValue);
}

/**
 * 环境变量助手函数，类似Laravel的env()函数
 * @param key 环境变量键
 * @param defaultValue 默认值
 */
export function env<T = any>(key: string, defaultValue?: T): T {
    return Loader.env(key, defaultValue);
} 