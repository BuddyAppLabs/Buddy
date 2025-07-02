/**
 * Buddy Foundation 配置管理器
 * 整合配置加载和存储功能，提供完整的配置管理
 */

import {
  ConfigManager,
  ConfigLoaderOptions,
  ConfigValue,
  ConfigObject,
  ConfigLoader,
} from './types.js';
import { Repository } from './Repository.js';
import { Loader } from './Loader.js';
import { EMOJI } from '../constants.js';

export class Manager implements ConfigManager {
  /** 配置仓库 */
  private repository: Repository;

  /** 是否为调试模式 */
  private debug: boolean;

  /** 配置加载器 */
  private loader: ConfigLoader;

  /** 加载选项 */
  private options?: ConfigLoaderOptions;

  /** 是否已初始化 */
  private initialized = false;

  constructor(loader?: ConfigLoader, debug?: boolean) {
    this.debug = debug || false;
    this.repository = new Repository();
    this.loader = loader || new Loader();
  }

  /**
   * 初始化配置系统
   * @param options 加载选项
   */
  async initialize(options: ConfigLoaderOptions): Promise<void> {
    try {
      this.options = options;

      if (this.debug) {
        console.log(`${EMOJI} [ConfigManager] 正在初始化配置系统...`);
      }

      // 加载配置
      const config = await this.loader.load(options);

      // 重置仓库并合并配置
      this.repository.reset(config);

      this.initialized = true;

      if (this.debug) {
        console.log(`${EMOJI} [ConfigManager] 配置系统初始化完成`);
        console.log(`  ➡️ 配置目录: ${options.configPath}`);
        console.log(`  ➡️ 环境文件: ${options.envPath || '未设置'}`);
        console.log(`  ➡️ 缓存启用: ${options.cache?.enabled ? '是' : '否'}`);

        // 输出已加载的配置文件
        const configKeys = Object.keys(config);
        if (configKeys.length > 0) {
          console.log(`  ➡️ 已加载配置: ${configKeys.join(', ')}`);
        }
      }
    } catch (error) {
      console.error(`${EMOJI} [ConfigManager] 配置系统初始化失败:`, error);
      throw error;
    }
  }

  /**
   * 重新加载配置
   */
  async reload(): Promise<void> {
    if (!this.options) {
      throw new Error('配置系统尚未初始化');
    }

    if (this.debug) {
      console.log('🔄 正在重新加载配置...');
    }

    // 清除缓存
    if (this.options.cache?.enabled) {
      await this.loader.clearCache(this.options.cache);
    }

    // 重新初始化
    await this.initialize(this.options);
  }

  /**
   * 获取配置值
   * @param key 配置键，支持点记法
   * @param defaultValue 默认值
   */
  get<T = ConfigValue>(key: string, defaultValue?: T): T {
    this.ensureInitialized();
    return this.repository.get(key, defaultValue);
  }

  /**
   * 设置配置值
   * @param key 配置键，支持点记法
   * @param value 配置值
   */
  set(key: string, value: ConfigValue): void {
    this.ensureInitialized();
    this.repository.set(key, value);
  }

  /**
   * 检查配置是否存在
   * @param key 配置键
   */
  has(key: string): boolean {
    this.ensureInitialized();
    return this.repository.has(key);
  }

  /**
   * 获取所有配置
   */
  all(): ConfigObject {
    this.ensureInitialized();
    return this.repository.all();
  }

  /**
   * 合并配置
   * @param config 要合并的配置对象
   */
  merge(config: ConfigObject): void {
    this.ensureInitialized();
    this.repository.merge(config);
  }

  /**
   * 观察配置变化
   * @param key 配置键
   * @param callback 变化回调
   */
  watch(
    key: string,
    callback: (newValue: ConfigValue, oldValue: ConfigValue) => void
  ): () => void {
    this.ensureInitialized();
    return this.repository.watch(key, callback);
  }

  /**
   * 获取配置加载器
   */
  getLoader(): ConfigLoader {
    return this.loader;
  }

  /**
   * 是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 获取配置仓库（用于高级操作）
   */
  getRepository(): Repository {
    return this.repository;
  }

  /**
   * 删除配置项
   * @param key 配置键
   */
  forget(key: string): void {
    this.ensureInitialized();
    this.repository.forget(key);
  }

  /**
   * 获取配置的某个分支
   * @param prefix 前缀
   */
  getConfig(prefix: string): ConfigObject {
    this.ensureInitialized();
    return this.repository.getConfig(prefix);
  }

  /**
   * 重置配置
   * @param config 新的配置对象
   */
  reset(config: ConfigObject = {}): void {
    this.repository.reset(config);
  }

  /**
   * 清除所有观察者
   */
  clearWatchers(): void {
    this.repository.clearWatchers();
  }

  /**
   * 获取观察者数量（用于调试）
   */
  getWatchersCount(): number {
    return this.repository.getWatchersCount();
  }

  /**
   * 获取加载选项
   */
  getOptions(): ConfigLoaderOptions | undefined {
    return this.options;
  }

  /**
   * 缓存当前配置
   */
  async cacheConfig(): Promise<void> {
    if (!this.options?.cache?.enabled) {
      throw new Error('缓存未启用');
    }

    const config = this.all();
    await this.loader.cache(config, this.options.cache);
  }

  /**
   * 清除配置缓存
   */
  async clearCache(): Promise<void> {
    if (!this.options?.cache?.enabled) {
      throw new Error('缓存未启用');
    }

    await this.loader.clearCache(this.options.cache);
  }

  /**
   * 检查配置系统状态
   */
  getStatus(): {
    initialized: boolean;
    configCount: number;
    watchersCount: number;
    cacheEnabled: boolean;
    configPath?: string;
    envPath?: string;
  } {
    return {
      initialized: this.initialized,
      configCount: this.initialized ? Object.keys(this.all()).length : 0,
      watchersCount: this.repository.getWatchersCount(),
      cacheEnabled: Boolean(this.options?.cache?.enabled),
      configPath: this.options?.configPath,
      envPath: this.options?.envPath,
    };
  }

  /**
   * 验证配置系统已初始化
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        `${EMOJI} 配置系统尚未初始化，请先调用 initialize() 方法`
      );
    }
  }

  /**
   * 销毁配置管理器
   */
  destroy(): void {
    this.clearWatchers();
    this.initialized = false;
    this.options = undefined;

    console.log('🗑️ 配置管理器已销毁');
  }
}
