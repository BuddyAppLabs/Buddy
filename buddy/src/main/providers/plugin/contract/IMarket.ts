import type { IMarketRepo } from './IMarketRepo';
import type { IDownloader } from './IDownloader';

/**
 * 插件市场服务契约
 */
export interface IMarket {
  /**
   * 获取插件仓储
   */
  getRepository(): IMarketRepo;

  /**
   * 获取下载器
   */
  getDownloader(): IDownloader;

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
}
