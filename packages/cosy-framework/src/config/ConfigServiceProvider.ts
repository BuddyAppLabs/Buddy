/**
 * 配置服务提供者
 */

import { ServiceProvider } from '../setting/ServiceProvider.js';
import { ConfigManager, ConfigLoaderOptions } from './types.js';
import { Manager } from './Manager.js';
import { Config } from './facades/Config.js';
import { join } from 'path';
import { app } from 'electron';
import { ConfigAbstract } from '../constants.js';

export class ConfigServiceProvider extends ServiceProvider {
  /**
   * 注册配置服务
   */
  public register(): void {
    const manager = new Manager(undefined, this.app.config().debug);

    // 注册配置管理器
    this.app.singleton(ConfigAbstract, () => manager);

    // 注册配置门面的管理器
    Config.setManager(manager);

    // 注册配置助手函数到容器
    this.app.bind('config.helper', () => {
      return (key?: string, defaultValue?: any) => {
        const manager = this.app.make<ConfigManager>(ConfigAbstract);
        if (!key) {
          return manager.all();
        }
        return manager.get(key, defaultValue);
      };
    });
  }

  /**
   * 启动配置服务
   */
  public override async boot(): Promise<void> {
    const manager = this.app.make<ConfigManager>(ConfigAbstract);

    // 获取应用基础路径
    const basePath = this.getBasePath();

    // 配置加载选项
    const options: ConfigLoaderOptions = {
      configPath: join(basePath, 'config'),
      envPath: join(basePath, '.env'),
      cache: {
        enabled: process.env.NODE_ENV === 'production',
        path: join(basePath, 'bootstrap', 'cache', 'config.json'),
        version: '1.0.0',
      },
      strict: false,
    };

    try {
      // 初始化配置系统
      await manager.initialize(options);
    } catch (error) {
      console.error('❌ 配置服务启动失败:', error);

      // 在严格模式下抛出错误，否则使用空配置继续
      if (options.strict) {
        throw error;
      }
    }
  }

  /**
   * 获取应用基础路径
   */
  private getBasePath(): string {
    // app.getAppPath() 在开发和生产环境中都能正确地返回应用内容的根目录
    // 开发环境: .../buddy
    // 生产环境: .../buddy.app/Contents/Resources/app
    return app.getAppPath();
  }
}
