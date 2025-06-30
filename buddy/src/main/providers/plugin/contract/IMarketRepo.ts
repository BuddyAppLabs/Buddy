/**
 * 插件仓储契约
 */
export interface IMarketRepo {
  /**
   * 安装插件
   * @param packageName 包名
   */
  install(packageName: string): Promise<void>;

  /**
   * 卸载插件
   * @param packageName 包名
   */
  uninstall(packageName: string): Promise<void>;

  /**
   * 更新插件
   * @param packageName 包名
   */
  update(packageName: string): Promise<void>;

  /**
   * 获取已安装的插件列表
   */
  getInstalledPlugins(): Promise<string[]>;
}
