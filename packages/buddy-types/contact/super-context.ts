/**
 * 插件上下文接口
 * 定义了插件可以访问的主进程能力
 */
export interface SuperContext {
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
  };

  /**
   * 插件元数据
   */
  meta: {
    /**
     * 插件ID
     */
    id: string;

    /**
     * 插件名称
     */
    name: string;

    /**
     * 插件版本
     */
    version: string;

    /**
     * 插件路径
     */
    path: string;
  };
}
