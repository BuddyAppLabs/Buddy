import { AIModelType, SuperContext } from '@coffic/buddy-types';
import { LogFacade } from '@coffic/cosy-logger';
import { resolve, isAbsolute } from 'path';
import fs from 'fs';
import { SettingFacade, UpdateFacade } from '@coffic/cosy-framework';
import { PluginEntity } from './PluginEntity';
import { shell } from 'electron';
import { IAIManager } from '@/main/providers/ai/IAIManager';

export class PluginContext {
  /**
   * 创建插件上下文，提供主进程能力
   * 这个上下文对象会被注入到插件的执行环境中
   *
   * @returns 插件上下文对象
   */
  static createPluginContext(
    plugin: PluginEntity,
    aiManager: IAIManager
  ): SuperContext {
    return {
      // 日志能力
      logger: {
        info: (message: string, ...args: any[]) => {
          LogFacade.channel(`plugin`).info(message, ...args);
        },
        warn: (message: string, ...args: any[]) => {
          LogFacade.channel(`plugin`).warn(message, ...args);
        },
        error: (message: string, ...args: any[]) => {
          LogFacade.channel(`plugin`).error(message, ...args);
        },
        debug: (message: string, ...args: any[]) => {
          LogFacade.channel(`plugin`).debug(message, ...args);
        },
      },

      // 文件系统能力（安全受限版本）
      fs: {
        readFile: async (filePath: string): Promise<string> => {
          // 安全检查：确保路径在插件目录内
          if (!this.isPathSafe(filePath, plugin)) {
            throw new Error('安全限制：无法访问插件目录外的文件');
          }

          try {
            return fs.readFileSync(filePath, 'utf-8');
          } catch (error) {
            LogFacade.channel(`plugin`).error(
              `读取文件失败: ${filePath}`,
              error
            );
            throw error;
          }
        },
        writeFile: async (filePath: string, content: string): Promise<void> => {
          // 安全检查：确保路径在插件目录内
          if (!this.isPathSafe(filePath, plugin)) {
            throw new Error('安全限制：无法访问插件目录外的文件');
          }

          try {
            fs.writeFileSync(filePath, content, 'utf-8');
          } catch (error) {
            LogFacade.channel(`plugin`).error(
              `写入文件失败: ${filePath}`,
              error
            );
            throw error;
          }
        },
        exists: (filePath: string): boolean => {
          // 安全检查：确保路径在插件目录内
          if (!this.isPathSafe(filePath, plugin)) {
            throw new Error('安全限制：无法访问插件目录外的文件');
          }

          return fs.existsSync(filePath);
        },
      },

      // 配置能力
      config: {
        get: (key: string, defaultValue?: any): any => {
          const configKey = `plugins.${plugin.id}.${key}`;
          return SettingFacade.get(configKey, defaultValue);
        },
        set: (key: string, value: any): void => {
          const configKey = `plugins.${plugin.id}.${key}`;
          SettingFacade.set(configKey, value);
        },
        openConfigFolder: (): void => {
          const settingPath = SettingFacade.getDirectoryPath();
          shell.openPath(settingPath);
        },
      },

      // 插件元数据
      meta: {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        path: plugin.path,
      },

      // AI能力
      ai: {
        generateText: async (prompt: string): Promise<string> => {
          return await aiManager.generateText(prompt);
        },
        setModelApiKey: async (
          provider: AIModelType,
          key: string
        ): Promise<void> => {
          return await aiManager.setApiKey(provider, key);
        },
      },

      // 版本信息
      version: {
        checkForUpdates: async (): Promise<string> => {
          return await UpdateFacade.checkForUpdates();
        },
      },
    };
  }

  /**
   * 检查路径是否安全（在插件目录内）
   * @param filePath 要检查的文件路径
   * @returns 是否安全
   */
  static isPathSafe(filePath: string, plugin: PluginEntity): boolean {
    const absolutePath = isAbsolute(filePath)
      ? filePath
      : resolve(plugin.path, filePath);

    // 检查路径是否在插件目录内
    return absolutePath.startsWith(plugin.path);
  }
}
