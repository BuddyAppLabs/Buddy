import { EventEmitter } from 'events';
import { ServiceContainer } from '../container/ServiceContainer.js';
import { ServiceProvider } from '../setting/ServiceProvider.js';
import { ApplicationConfig } from './ApplicationConfig.js';
import { IApplication } from '../contract/IApplication.js';
import {
  AppAbstract,
  AppAlias,
  ContainerAbstract,
  ContainerAlias,
  EMOJI,
} from '../constants.js';

/**
 * 应用主类 - 应用程序的核心
 * 参考 Laravel Application 设计
 * 负责应用的启动、配置加载和服务提供者注册
 */
export class Application extends EventEmitter implements IApplication {
  private static _instance: Application;
  private _container: ServiceContainer;
  private _config: ApplicationConfig;
  private _providers: ServiceProvider[] = [];
  private _booted: boolean = false;
  private _running: boolean = false;

  private constructor(config: ApplicationConfig) {
    super();

    this.emit('log', 'info', '[Application] Creating application instance');

    this._config = config;
    this._container = ServiceContainer.getInstance();
    this.registerBaseBindings();

    if (this.config().debug) {
      console.log(
        `${EMOJI} [Application] Application created(📢 Debug Mode 📢)`
      );
    }
  }

  /**
   * 获取应用实例
   * @param config 应用配置
   * @returns 应用实例
   */
  public static getInstance(config?: ApplicationConfig): Application {
    if (!Application._instance) {
      if (!config) {
        throw new Error(
          'Application config is required for first initialization'
        );
      }
      Application._instance = new Application(config);
    }
    return Application._instance;
  }

  /**
   * 注册基础绑定
   */
  private registerBaseBindings(): void {
    this._container.instance(AppAbstract, this);
    this._container.instance(ContainerAbstract, this._container);

    // 注册别名
    AppAlias.forEach((alias) => {
      this._container.alias(alias, AppAbstract);
    });
    ContainerAlias.forEach((alias) => {
      this._container.alias(alias, ContainerAbstract);
    });
  }

  /**
   * 注册服务提供者
   * @param provider 服务提供者类
   */
  public register(provider: new (app: Application) => ServiceProvider): this {
    const providerInstance = new provider(this);
    this._providers.push(providerInstance);

    this.emit(
      'log',
      'info',
      `[Application] Registering service provider: ${provider.name}`
    );
    providerInstance.register();

    return this;
  }

  /**
   * 启动应用
   */
  public async boot(): Promise<void> {
    this.emit('log', 'info', '[Application] Booting application');
    if (this._booted) {
      return;
    }

    this.emit('booting');

    // 启动所有服务提供者
    for (const provider of this._providers) {
      if (provider.boot) {
        this.emit(
          'log',
          'info',
          `[Application] Booting service provider: ${provider.constructor.name}`
        );
        await provider.boot();
      }
    }

    this._booted = true;
    this.emit('booted');
    this.emit('log', 'info', '[Application] Application booted');
  }

  /**
   * 运行应用
   */
  public async run(): Promise<void> {
    if (!this._booted) {
      await this.boot();
    }

    this.emit('running');
    this._running = true;
  }

  /**
   * 获取服务容器
   */
  public container(): ServiceContainer {
    return this._container;
  }

  /**
   * 获取配置
   */
  public config(): ApplicationConfig;
  public config<T>(key: keyof ApplicationConfig): T;
  public config<T>(key?: keyof ApplicationConfig): T | ApplicationConfig {
    if (key) {
      return this._config[key] as T;
    }
    return this._config;
  }

  /**
   * 判断是否为开发环境
   */
  public isDevelopment(): boolean {
    return this._config.env === 'development';
  }

  /**
   * 判断是否为生产环境
   */
  public isProduction(): boolean {
    return this._config.env === 'production';
  }

  /**
   * 判断是否为测试环境
   */
  public isTest(): boolean {
    return this._config.env === 'test';
  }

  /**
   * 判断应用是否已启动
   */
  public isBooted(): boolean {
    return this._booted;
  }

  /**
   * 判断应用是否正在运行
   */
  public isRunning(): boolean {
    return this._running;
  }

  /**
   * Get the user data path.
   */
  public userDataPath(): string {
    return this._config.paths.userData;
  }

  /**
   * 关闭应用
   */
  public async shutdown(): Promise<void> {
    this.emit('shutting-down');
    this.emit('log', 'info', '[Application] Shutting down application');

    // 关闭所有服务提供者
    for (const provider of this._providers.reverse()) {
      if (provider.shutdown) {
        this.emit(
          'log',
          'info',
          `[Application] Shutting down service provider: ${provider.constructor.name}`
        );
        await provider.shutdown();
      }
    }

    this._running = false;
    this.emit('shutdown');
    this.emit('log', 'info', '[Application] Application shutdown complete');
  }

  /**
   * 解析服务
   * @param abstract 服务标识符
   */
  public make<T>(abstract: string): T {
    return this._container.resolve<T>(abstract);
  }

  /**
   * 绑定服务
   * @param abstract 服务标识符
   * @param factory 服务工厂
   * @param singleton 是否单例
   */
  public bind<T>(
    abstract: string,
    factory: (container: ServiceContainer) => T,
    singleton: boolean = false
  ): void {
    this._container.bind(abstract, factory, singleton);
  }

  /**
   * 绑定单例服务
   * @param abstract 服务标识符
   * @param factory 服务工厂
   */
  public singleton<T>(
    abstract: string,
    factory: (container: ServiceContainer) => T
  ): void {
    this._container.singleton(abstract, factory);
  }
}

// 导出应用实例工厂
export const createApp = (config: ApplicationConfig): Application => {
  return Application.getInstance(config);
};

// 导出全局应用实例访问器
export const app = (): Application => {
  return Application.getInstance();
};
