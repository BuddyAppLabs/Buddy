/**
 * 日志服务提供者
 * 负责将日志服务注册到依赖注入容器中
 * 参考Laravel的设计模式
 */
import {
  ServiceProvider,
  ILogManager,
  ILogLevel,
  Config,
  ILogConfig,
} from '@coffic/cosy-framework';
import { LogManager } from './LogManager.js';

export class LogServiceProvider extends ServiceProvider {
  public register(): void {
    // 注册日志配置
    this.app.container().singleton('log.config', () => {
      return this.getLogConfig();
    });

    // 注册日志管理器
    this.app.container().singleton('log.manager', (container) => {
      const config = container.resolve<ILogConfig>('log.config');
      return new LogManager(config);
    });
  }

  public async boot(): Promise<void> {
    const manager = this.app.make<ILogManager>('log.manager');

    // 扩展自定义驱动的示例
    this.registerCustomDrivers(manager);
  }

  public async shutdown(): Promise<void> {
    console.log('👋 日志系统正在关闭...');
    // 这里可以添加清理逻辑，比如刷新缓冲区等
  }

  /**
   * 获取日志配置
   * 从用户配置中读取，如果没有则使用默认配置
   */
  private getLogConfig(): ILogConfig {
    // 默认配置
    const defaultConfig: ILogConfig = {
      default: 'app',
      channels: {
        app: {
          driver: 'electron',
          level: ILogLevel.INFO,
          format: 'structured',
          includeTimestamp: false,
        },
        error: {
          driver: 'electron',
          level: ILogLevel.ERROR,
          format: 'json',
        },
      },
    };

    const userConfig = Config.get<{ loggerConfig: ILogConfig }>('logger');

    // 从用户配置中读取，如果没有则使用默认配置
    return userConfig?.loggerConfig || defaultConfig;
  }

  /**
   * 注册自定义驱动示例
   */
  private registerCustomDrivers(manager: ILogManager): void {
    // 示例：注册一个自定义的文件驱动
    manager.extend('custom-file', (config) => {
      // 这里可以返回自定义的日志通道实现
      // 比如集成第三方日志服务等
      console.log('创建自定义文件驱动:', config);
      // 暂时返回默认的electron驱动
      const { driver, ...restConfig } = config;
      return manager.createChannel('temp', {
        driver: 'electron',
        ...restConfig,
      });
    });
  }
}
