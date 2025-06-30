/**
 * 日志服务提供者
 * 负责将日志服务注册到依赖注入容器中
 * 参考Laravel的设计模式
 */
import {
  ILogConfig,
  ILogManager,
  ServiceProvider,
  Config,
  ILogLevel,
} from '@coffic/cosy-framework';
import { LogManager } from './LogManager.js';

export class LogServiceProvider extends ServiceProvider {
  public static LogManager = 'log';

  register(): void {
    // Register the log manager as a singleton, but defer its creation.
    // The actual instance will be created in the boot method when the config is ready.
    this.app.singleton(LogServiceProvider.LogManager, () => {
      // This will be replaced in boot()
      return new LogManager(this.getLogConfig());
    });
  }

  async boot(): Promise<void> {
    // Now that the config is loaded, we can create the real LogManager instance.
    const config = this.getLogConfig();
    this.app
      .container()
      .instance(LogServiceProvider.LogManager, new LogManager(config));
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
          driver: 'console',
          level: ILogLevel.INFO,
        },
      },
    };

    const userConfig = Config.get<ILogConfig>('logger');

    // Return user config if available, otherwise use default config.
    return userConfig || defaultConfig;
  }
}
