/**
 * 插件仓库契约
 * 定义了插件仓库需要实现的方法
 */
export interface IPluginRepo {
  /**
   * 获取仓库的根目录
   */
  getRootDir(): string;

  /**
   * 确保仓库目录存在
   */
  ensureRepoDirs(): Promise<void>;

  /**
   * 获取插件列表
   */
  getAllPlugins(): Promise<any[]>;

  /**
   * 获取可发送的插件列表
   */
  getSendablePlugins(): Promise<any[]>;

  /**
   * 根据插件ID查找插件
   */
  find(id: string): Promise<any | null>;

  /**
   * 根据插件ID判断插件是否存在
   */
  has(id: string): Promise<boolean>;

  /**
   * 获取插件类型
   */
  getPluginType(): string;
}
