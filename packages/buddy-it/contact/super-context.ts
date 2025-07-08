import { AIModelType } from './api-ai.js';

/**
 * 插件上下文接口
 * 定义了插件可以访问的主进程能力
 */
export interface SuperContext {
  /**
   * 动作ID
   */
  actionId: string;

  /**
   * 搜索关键词
   */
  keyword: string;

  /**
   * 覆盖应用
   */
  overlaidApp: string;

  /**
   * 日志能力
   */
  logger: {
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
  };

  /**
   * 文件系统能力（安全受限版本）
   */
  fs: {
    /**
     * 读取文件内容
     * 只能读取插件目录内的文件
     * @param filePath 文件路径
     */
    readFile: (filePath: string) => Promise<string>;

    /**
     * 写入文件内容
     * 只能写入插件目录内的文件
     * @param filePath 文件路径
     * @param content 文件内容
     */
    writeFile: (filePath: string, content: string) => Promise<void>;

    /**
     * 检查文件是否存在
     * 只能检查插件目录内的文件
     * @param filePath 文件路径
     */
    exists: (filePath: string) => boolean;
  };

  /**
   * 配置能力
   */
  config: {
    /**
     * 获取插件配置
     * @param key 配置键
     * @param defaultValue 默认值
     */
    get: (key: string, defaultValue?: any) => any;

    /**
     * 设置插件配置
     * @param key 配置键
     * @param value 配置值
     */
    set: (key: string, value: any) => void;

    /**
     * 打开配置文件夹
     */
    openConfigFolder: () => void;

    /**
     * 打开日志文件夹
     */
    openLogsFolder: () => void;
  };

  /**
   * AI能力
   */
  ai: {
    // 生成文本，比如：提供一段话，生成总结
    generateText: (prompt: string) => Promise<string>;

    /**
     * 设置AI模型API密钥
     * @param provider 提供者名称
     * @param key 密钥
     * @returns 是否成功
     */
    setModelApiKey: (provider: AIModelType, key: string) => Promise<void>;
  };

  /**
   * 版本信息
   */
  version: {
    getCurrentVersion: () => string;
    checkForUpdates: () => Promise<string>;
  };
}
