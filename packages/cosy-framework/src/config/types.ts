/**
 * Buddy Foundation 配置系统类型定义
 * 提供类似Laravel的配置管理功能
 */

/**
 * 配置值类型
 */
export type ConfigValue = string | number | boolean | object | null | undefined | ConfigValue[];

/**
 * 配置对象类型
 */
export type ConfigObject = Record<string, ConfigValue>;

/**
 * 配置缓存选项
 */
export interface ConfigCacheOptions {
    /** 是否启用缓存 */
    enabled: boolean;
    /** 缓存文件路径 */
    path?: string;
    /** 缓存版本 */
    version?: string;
}

/**
 * 配置加载器选项
 */
export interface ConfigLoaderOptions {
    /** 配置文件目录 */
    configPath: string;
    /** 环境配置文件路径 */
    envPath?: string;
    /** 缓存选项 */
    cache?: ConfigCacheOptions;
    /** 是否严格模式（缺少必需配置时抛出错误） */
    strict?: boolean;
}

/**
 * 配置文件定义
 */
export interface ConfigFileDefinition {
    /** 配置文件名（不含扩展名） */
    name: string;
    /** 配置文件路径 */
    path: string;
    /** 是否为必需文件 */
    required?: boolean;
    /** 配置内容 */
    content?: ConfigObject;
}

/**
 * 配置观察者接口
 */
export interface ConfigWatcher {
    /** 配置键路径 */
    key: string;
    /** 回调函数 */
    callback: (newValue: ConfigValue, oldValue: ConfigValue) => void;
}

/**
 * 配置仓库接口
 */
export interface ConfigRepository {
    /**
     * 获取配置值
     * @param key 配置键，支持点记法
     * @param defaultValue 默认值
     */
    get<T = ConfigValue>(key: string, defaultValue?: T): T;

    /**
     * 设置配置值
     * @param key 配置键，支持点记法
     * @param value 配置值
     */
    set(key: string, value: ConfigValue): void;

    /**
     * 检查配置是否存在
     * @param key 配置键
     */
    has(key: string): boolean;

    /**
     * 获取所有配置
     */
    all(): ConfigObject;

    /**
     * 合并配置
     * @param config 要合并的配置对象
     */
    merge(config: ConfigObject): void;

    /**
     * 观察配置变化
     * @param key 配置键
     * @param callback 变化回调
     */
    watch(key: string, callback: (newValue: ConfigValue, oldValue: ConfigValue) => void): () => void;
}

/**
 * 配置加载器接口
 */
export interface ConfigLoader {
    /**
     * 加载配置
     * @param options 加载选项
     */
    load(options: ConfigLoaderOptions): Promise<ConfigObject>;

    /**
     * 缓存配置
     * @param config 配置对象
     * @param options 缓存选项
     */
    cache(config: ConfigObject, options: ConfigCacheOptions): Promise<void>;

    /**
     * 从缓存加载配置
     * @param options 缓存选项
     */
    loadFromCache(options: ConfigCacheOptions): Promise<ConfigObject | null>;

    /**
     * 清除缓存
     * @param options 缓存选项
     */
    clearCache(options: ConfigCacheOptions): Promise<void>;
}

/**
 * 配置管理器接口
 */
export interface ConfigManager extends ConfigRepository {
    /**
     * 初始化配置系统
     * @param options 加载选项
     */
    initialize(options: ConfigLoaderOptions): Promise<void>;

    /**
     * 重新加载配置
     */
    reload(): Promise<void>;

    /**
     * 获取配置加载器
     */
    getLoader(): ConfigLoader;

    /**
     * 是否已初始化
     */
    isInitialized(): boolean;

    /**
     * 删除配置项
     * @param key 配置键
     */
    forget(key: string): void;

    /**
     * 获取配置的某个分支
     * @param prefix 前缀
     */
    getConfig(prefix: string): ConfigObject;

    /**
     * 获取配置系统状态
     */
    getStatus(): {
        initialized: boolean;
        configCount: number;
        watchersCount: number;
        cacheEnabled: boolean;
        configPath?: string;
        envPath?: string;
    };

    /**
     * 缓存当前配置
     */
    cacheConfig(): Promise<void>;

    /**
     * 清除配置缓存
     */
    clearCache(): Promise<void>;
} 