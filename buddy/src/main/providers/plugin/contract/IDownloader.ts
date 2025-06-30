/**
 * 下载器契约
 */
export interface IDownloader {
  /**
   * 下载插件包
   * @param packageName 包名
   */
  download(packageName: string): Promise<void>;

  /**
   * 获取插件包信息
   * @param packageName 包名
   */
  getPackageInfo(packageName: string): Promise<{
    name: string;
    version: string;
    description?: string;
  }>;
}
