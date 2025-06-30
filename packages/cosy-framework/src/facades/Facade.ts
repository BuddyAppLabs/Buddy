/**
 * Facade基类
 * 参考Laravel的Facade设计，提供静态代理访问服务的能力
 */
import { Application } from '../index.js';

export abstract class Facade {
  /**
   * 应用实例
   */
  protected static app: Application;

  /**
   * 已解析的实例缓存
   */
  private static resolvedInstance: { [key: string]: any } = {};

  /**
   * 设置应用实例
   */
  public static setFacadeApplication(app: Application): void {
    Facade.app = app;
  }

  /**
   * 获取门面访问器
   * 子类必须实现此方法以返回服务标识符
   */
  protected static getFacadeAccessor(): string {
    throw new Error('Facade does not implement getFacadeAccessor method.');
  }

  /**
   * 获取已注册的实例
   */
  protected static getFacadeRoot(): any {
    const name = this.getFacadeAccessor();

    if (!name) {
      throw new Error('A facade root has not been set.');
    }

    // 检查缓存
    if (this.resolvedInstance[name]) {
      return this.resolvedInstance[name];
    }

    // 从容器中解析实例
    if (!this.app) {
      throw new Error('Application has not been set.');
    }

    return (this.resolvedInstance[name] = this.app.make(name));
  }

  /**
   * 清除已解析的实例
   */
  public static clearResolvedInstance(name: string): void {
    delete this.resolvedInstance[name];
  }

  /**
   * 清除所有已解析的实例
   */
  public static clearResolvedInstances(): void {
    this.resolvedInstance = {};
  }

  /**
   * 获取应用实例
   */
  protected static getFacadeApplication(): Application {
    if (!this.app) {
      throw new Error('Application has not been set.');
    }
    return this.app;
  }

  /**
   * 处理对未定义方法的调用
   */
  public static __call(method: string, args: any[]): any {
    const instance = this.getFacadeRoot();

    if (!instance) {
      throw new Error('A facade root has not been set.');
    }

    if (typeof instance[method] !== 'function') {
      throw new Error(
        `❌ [Facade] Method ${method} does not exist on '${this.getFacadeAccessor()}'`
      );
    }

    return instance[method](...args);
  }
}
