import { AIModelType, SuperContext } from '@coffic/buddy-it';
import { SettingFacade, UpdateFacade } from '@coffic/cosy-framework';
import { IAIManager } from '@/main/providers/ai/IAIManager';
import { PluginEntity } from '../model/PluginEntity';
import { LogFacade } from '@coffic/cosy-framework';
import { resolve, isAbsolute } from 'path';
import fs from 'fs';
import { app, shell } from 'electron';
import os from 'os';

export class ContextManager {
  /**
   * 创建上下文，提供主进程能力
   * 这个上下文对象会被注入到插件的执行环境中
   *
   * @returns 上下文对象
   */
  static createContext(
    plugin: PluginEntity | undefined,
    aiManager: IAIManager | undefined,
    actionId: string,
    keyword: string,
    overlaidApp: string
  ): SuperContext {
    return {
      actionId,
      keyword,
      overlaidApp,

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
          if (!plugin) {
            throw new Error('插件不存在');
          }

          // 安全检查：确保路径在插件目录内
          if (!this.isPathSafe(filePath, plugin)) {
            throw new Error('安全限制：无法访问插件目录外的文件');
          }

          try {
            return fs.readFileSync(filePath, 'utf-8');
          } catch (error) {
            LogFacade.channel(`plugin`).error(`读取文件失败: ${filePath}`, {
              error,
            });
            throw error;
          }
        },
        writeFile: async (filePath: string, content: string): Promise<void> => {
          if (!plugin) {
            throw new Error('插件不存在');
          }

          // 安全检查：确保路径在插件目录内
          if (!this.isPathSafe(filePath, plugin)) {
            throw new Error('安全限制：无法访问插件目录外的文件');
          }

          try {
            fs.writeFileSync(filePath, content, 'utf-8');
          } catch (error) {
            LogFacade.channel(`plugin`).error(`写入文件失败: ${filePath}`, {
              error,
            });
            throw error;
          }
        },
        exists: (filePath: string): boolean => {
          if (!plugin) {
            throw new Error('插件不存在');
          }

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
          if (!plugin) {
            throw new Error('插件不存在');
          }

          const configKey = `plugins.${plugin.id}.${key}`;
          return SettingFacade.get(configKey, defaultValue);
        },
        set: (key: string, value: any): void => {
          if (!plugin) {
            throw new Error('插件不存在');
          }

          const configKey = `plugins.${plugin.id}.${key}`;
          SettingFacade.set(configKey, value);
        },
        openConfigFolder: (): void => {
          const settingPath = SettingFacade.getDirectoryPath();
          shell.openPath(settingPath);
        },
        openLogsFolder: async (): Promise<void> => {
          const logsPath = `${os.homedir()}/Library/Logs/Buddy`;
          try {
            const result = await shell.openPath(logsPath);
            if (result) {
              // result 非空字符串表示有错误
              LogFacade.channel(`plugin`).error(
                `打开日志文件夹失败: ${result}`
              );
            } else {
              LogFacade.channel(`plugin`).info(`已打开日志文件夹: ${logsPath}`);
            }
          } catch (error) {
            LogFacade.channel(`plugin`).error(
              `打开日志文件夹异常: ${logsPath}`,
              {
                error,
              }
            );
          }
        },
      },

      // AI能力
      ai: {
        generateText: async (prompt: string): Promise<string> => {
          if (!aiManager) {
            throw new Error('AI管理器不存在');
          }

          return await aiManager.generateText(prompt);
        },
        setModelApiKey: async (
          provider: AIModelType,
          key: string
        ): Promise<void> => {
          if (!aiManager) {
            throw new Error('AI管理器不存在');
          }

          return await aiManager.setApiKey(provider, key);
        },
      },

      // 版本信息
      version: {
        getCurrentVersion: (): string => {
          return app.getVersion();
        },
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
