/**
 * 基础插件仓库
 * 负责从指定目录读取插件信息
 */
import { join } from 'path';
import fs from 'fs';
import { PluginRepoContract } from '../contracts/PluginRepoContract.js';
import { PluginEntity } from '../model/PluginEntity.js';
import { LogFacade } from '@coffic/cosy-logger';
import { PluginType } from '@coffic/buddy-types';

const verbose = false;

export abstract class BasePluginRepo implements PluginRepoContract {
  protected rootDir: string;

  protected constructor(pluginsDir: string) {
    this.rootDir = pluginsDir;
  }

  /**
   * 获取仓库的根目录
   */
  public getRootDir(): string {
    return this.rootDir;
  }

  /**
   * 确保仓库目录存在
   */
  public async ensureRepoDirs(): Promise<void> {
    if (!fs.existsSync(this.rootDir)) {
      throw new Error(`仓库目录不存在: ${this.rootDir}`);
    }
  }

  /**
   * 获取插件列表
   */
  public async getAllPlugins(): Promise<PluginEntity[]> {
    if (verbose) {
      LogFacade.channel('plugin').info(
        `[BasePluginRepo] 获取插件列表，根目录是`,
        { rootDir: this.rootDir }
      );
    }

    if (!fs.existsSync(this.rootDir)) {
      return [];
    }

    const plugins: PluginEntity[] = [];

    try {
      const entries = await fs.promises.readdir(this.rootDir, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const pluginPath = join(this.rootDir, entry.name);

        try {
          const plugin = await PluginEntity.fromDir(
            pluginPath,
            this.getPluginType()
          );
          plugins.push(plugin);
        } catch (error) {
          LogFacade.channel('plugin').warn(
            `[BasePluginRepo] 读取插件信息失败`,
            { error: error instanceof Error ? error.message : String(error) }
          );
        }
      }

      // 过滤出有效的
      const validPlugins = plugins.filter(
        (plugin) => plugin.validation?.isValid
      );
      if (validPlugins.length === 0) {
        return [];
      } else {
        if (verbose) {
          LogFacade.channel('plugin').info(
            `[BasePluginRepo] 有效的插件数量` + validPlugins.length
          );
        }
      }

      // 排序插件列表
      validPlugins.sort((a, b) => a.name.localeCompare(b.name));

      return validPlugins;
    } catch (error) {
      LogFacade.channel('plugin').error(`[BasePluginRepo] 获取插件列表失败`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * 获取可发送的插件列表
   */
  public async getSendablePlugins(): Promise<any[]> {
    const plugins = await this.getAllPlugins();
    return await Promise.all(
      plugins.map((plugin) => plugin.getSendablePlugin())
    );
  }

  /**
   * 根据插件ID查找插件
   */
  public async find(id: string): Promise<PluginEntity | null> {
    try {
      const plugins = await this.getAllPlugins();
      return plugins.find((plugin) => plugin.id === id) || null;
    } catch (error) {
      LogFacade.channel('plugin').error(
        `[BasePluginRepo] 查找插件失败: ${id}`,
        { error: error instanceof Error ? error.message : String(error) }
      );
      return null;
    }
  }

  /**
   * 根据插件ID判断插件是否存在
   */
  public async has(id: string): Promise<boolean> {
    if (typeof id !== 'string') {
      LogFacade.channel('plugin').error(
        `[BasePluginRepo.has] 判断插件是否存在，插件ID必须是字符串, 但是传入的是`,
        { id }
      );
      throw new Error('插件ID必须是字符串');
    }

    LogFacade.channel('plugin').debug(`[BasePluginRepo.has] 判断插件是否存在`, {
      id,
    });

    return (await this.getAllPlugins()).some((plugin) => plugin.id === id);
  }

  /**
   * 获取插件类型
   */
  public abstract getPluginType(): PluginType;
}
