/**
 * 门面基类
 */
import { ServiceContainer } from '../container/ServiceContainer.js';

export interface FacadeInterface {
    getFacadeAccessor(): string;
}

export abstract class BaseFacade implements FacadeInterface {
    private static container: ServiceContainer = ServiceContainer.getInstance();

    /**
     * 获取门面访问器（服务标识符）
     */
    public abstract getFacadeAccessor(): string;

    /**
     * 获取服务实例
     */
    protected static getInstance<T>(): T {
        const facade = new (this as any)();
        return BaseFacade.container.resolve<T>(facade.getFacadeAccessor());
    }

    /**
     * 代理方法调用到实际服务
     */
    public static __callStatic(method: string, args: any[]): any {
        const instance = this.getInstance();
        return (instance as any)[method](...args);
    }
}

/**
 * 创建门面代理
 * @param facadeClass 门面类
 */
export function createFacade<T extends object>(facadeClass: new () => FacadeInterface): T {
    const facade = new facadeClass();
    const container = ServiceContainer.getInstance();

    return container.createFacade<T>(facade.getFacadeAccessor());
} 