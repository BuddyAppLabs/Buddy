/**
 * Buddy Foundation 配置加载器
 * 负责加载配置文件、处理缓存和环境变量
 */

import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import {
  ConfigLoader,
  ConfigLoaderOptions,
  ConfigCacheOptions,
  ConfigObject,
  ConfigFileDefinition,
} from './types.js';
import { mergeConfig, parseEnvValue } from './utils.js';
import { EMOJI } from '../constants.js';

const debug = false;

export class Loader implements ConfigLoader {
  /** 支持的配置文件扩展名 */
  private readonly supportedExtensions = ['.js', '.mjs', '.ts', '.json'];

  /**
   * 加载配置
   * @param options 加载选项
   */
  async load(options: ConfigLoaderOptions): Promise<ConfigObject> {
    let config: ConfigObject = {};

    // 尝试从缓存加载
    if (options.cache?.enabled) {
      const cachedConfig = await this.loadFromCache(options.cache);
      if (cachedConfig) {
        if (debug) {
          console.log('⚡ 从缓存加载配置');
        }
        return cachedConfig;
      }
    }

    // 加载环境变量
    if (options.envPath) {
      await this.loadEnvironmentVariables(options.envPath);
    }

    // 扫描配置文件
    const configFiles = await this.scanConfigFiles(options.configPath);

    // 按文件名排序，确保加载顺序一致
    configFiles.sort((a, b) => a.name.localeCompare(b.name));

    // 加载每个配置文件
    for (const file of configFiles) {
      try {
        const fileConfig = await this.loadConfigFile(file);
        config = mergeConfig(config, { [file.name]: fileConfig });

        if (debug) {
          console.log(`${EMOJI} [ConfigLoader] 已加载配置文件: ${file.name}`);
        }
      } catch (error) {
        const message = `加载配置文件失败: ${file.path}`;

        if (file.required || options.strict) {
          throw new Error(`${message} - ${error}`);
        } else {
          console.warn(`⚠️ ${message}:`, error);
        }
      }
    }

    // 缓存配置
    if (options.cache?.enabled) {
      await this.cache(config, options.cache);
    }

    return config;
  }

  /**
   * 缓存配置
   * @param config 配置对象
   * @param options 缓存选项
   */
  async cache(
    config: ConfigObject,
    options: ConfigCacheOptions
  ): Promise<void> {
    if (!options.path) {
      throw new Error('缓存路径不能为空');
    }

    try {
      // 确保缓存目录存在
      await this.ensureDirectoryExists(options.path);

      // 生成缓存内容
      const cacheContent = {
        version: options.version || '1.0.0',
        timestamp: Date.now(),
        config,
      };

      // 写入缓存文件
      const cacheData = JSON.stringify(cacheContent, null, 2);
      await fs.writeFile(options.path, cacheData, 'utf8');

      console.log(`💾 配置缓存已保存: ${options.path}`);
    } catch (error) {
      console.error('保存配置缓存失败:', error);
      throw error;
    }
  }

  /**
   * 从缓存加载配置
   * @param options 缓存选项
   */
  async loadFromCache(
    options: ConfigCacheOptions
  ): Promise<ConfigObject | null> {
    if (!options.path) {
      return null;
    }

    try {
      const cacheData = await fs.readFile(options.path, 'utf8');
      const cache = JSON.parse(cacheData);

      // 检查版本
      if (options.version && cache.version !== options.version) {
        console.log('📦 缓存版本不匹配，重新加载配置');
        return null;
      }

      return cache.config;
    } catch (error) {
      // 缓存文件不存在或损坏，返回null
      return null;
    }
  }

  /**
   * 清除缓存
   * @param options 缓存选项
   */
  async clearCache(options: ConfigCacheOptions): Promise<void> {
    if (!options.path) {
      return;
    }

    try {
      await fs.unlink(options.path);
      console.log('🗑️ 配置缓存已清除');
    } catch (error) {
      // 文件不存在，忽略错误
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 扫描配置文件
   * @param configPath 配置目录路径
   */
  private async scanConfigFiles(
    configPath: string
  ): Promise<ConfigFileDefinition[]> {
    const files: ConfigFileDefinition[] = [];

    try {
      const entries = await fs.readdir(configPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile()) {
          const ext = extname(entry.name);

          if (this.supportedExtensions.includes(ext)) {
            const name = basename(entry.name, ext);
            const path = join(configPath, entry.name);

            files.push({
              name,
              path,
              required: false, // 默认非必需，可以根据需要调整
            });
          }
        }
      }
    } catch (error) {
      throw new Error(`扫描配置目录失败: ${configPath} - ${error}`);
    }

    return files;
  }

  /**
   * 加载单个配置文件
   * @param file 配置文件定义
   */
  private async loadConfigFile(
    file: ConfigFileDefinition
  ): Promise<ConfigObject> {
    const ext = extname(file.path);

    switch (ext) {
      case '.json':
        return this.loadJsonConfig(file.path);
      case '.js':
      case '.mjs':
      case '.ts':
        return this.loadModuleConfig(file.path);
      default:
        throw new Error(`不支持的配置文件类型: ${ext}`);
    }
  }

  /**
   * 加载JSON配置文件
   * @param filePath 文件路径
   */
  private async loadJsonConfig(filePath: string): Promise<ConfigObject> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`JSON配置文件解析失败: ${error}`);
    }
  }

  /**
   * 加载模块配置文件（JS/TS）
   * @param filePath 文件路径
   */
  private async loadModuleConfig(filePath: string): Promise<ConfigObject> {
    try {
      // Use native dynamic import, as electron-vite has already compiled TS to JS.
      const module = await import(filePath);

      // 支持默认导出和命名导出
      const config = module.default || module;

      if (typeof config === 'function') {
        // 如果是函数，调用它获取配置
        return await config();
      }

      return config;
    } catch (error) {
      throw new Error(`模块配置文件加载失败: ${error}`);
    }
  }

  /**
   * 加载环境变量
   * @param envPath 环境变量文件路径
   */
  private async loadEnvironmentVariables(envPath: string): Promise<void> {
    try {
      const content = await fs.readFile(envPath, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();

        // 跳过空行和注释
        if (!trimmed || trimmed.startsWith('#')) {
          continue;
        }

        // 解析键值对
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const [, key, value] = match;
          const trimmedKey = key.trim();
          const trimmedValue = value.trim();

          // 移除引号
          const cleanValue = this.removeQuotes(trimmedValue);

          // 设置环境变量
          process.env[trimmedKey] = cleanValue;
        }
      }

      console.log(`🌍 已加载环境变量: ${envPath}`);
    } catch (error) {
      // 环境变量文件不是必需的
      if ((error as any).code !== 'ENOENT') {
        console.warn('加载环境变量文件失败:', error);
      }
    }
  }

  /**
   * 移除字符串两端的引号
   * @param value 字符串值
   */
  private removeQuotes(value: string): string {
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }
    return value;
  }

  /**
   * 确保目录存在
   * @param filePath 文件路径
   */
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = join(filePath, '..');
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * 获取环境变量值并解析类型
   * @param key 环境变量键
   * @param defaultValue 默认值
   */
  static env(key: string, defaultValue?: any): any {
    const value = process.env[key];

    if (value === undefined) {
      return defaultValue;
    }

    return parseEnvValue(value);
  }
}
