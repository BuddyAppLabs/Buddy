/**
 * 插件市场管理器
 * 负责插件的安装、卸载、更新等操作
 */
import { IDownloader } from '../contract/IDownloader.js';
import type { IMarketRepo } from '../contract/IMarketRepo.js';
import type { IMarket } from '../contract/IMarket.js';

export class MarketManager implements IMarket {
  /**
   * 构造函数
   * @param repository 插件仓储
   * @param downloader 下载器
   */
  constructor(
    private readonly repository: IMarketRepo,
    private readonly downloader: IDownloader
  ) {}

  /**
   * 获取插件仓储
   */
  public getRepository(): IMarketRepo {
    return this.repository;
  }

  /**
   * 获取下载器
   */
  public getDownloader(): IDownloader {
    return this.downloader;
  }

  /**
   * 安装插件
   * @param packageName 包名
   */
  public async install(packageName: string): Promise<void> {
    // TODO: 实现插件安装逻辑
    await this.downloader.download(packageName);
    await this.repository.install(packageName);
  }

  /**
   * 卸载插件
   * @param packageName 包名
   */
  public async uninstall(packageName: string): Promise<void> {
    // TODO: 实现插件卸载逻辑
    await this.repository.uninstall(packageName);
  }

  /**
   * 更新插件
   * @param packageName 包名
   */
  public async update(packageName: string): Promise<void> {
    // TODO: 实现插件更新逻辑
    await this.downloader.download(packageName);
    await this.repository.update(packageName);
  }
}
