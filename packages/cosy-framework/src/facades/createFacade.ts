/**
 * 创建门面代理
 * 提供类型安全的门面代理创建功能
 */
import { Facade } from './Facade.js';

type Constructor<T> = new (...args: any[]) => T;
export type StaticType<T> = { [P in keyof T]: T[P] };

interface FacadeStatic {
    [key: string]: any;
    __call(method: string, args: any[]): any;
}

/**
 * 创建一个类型安全的门面代理
 * @param facadeClass Facade类
 */
export function createFacade<T>(facadeClass: Constructor<Facade> & FacadeStatic): StaticType<T> {
    return new Proxy({} as StaticType<T>, {
        get(target: any, method: string) {
            if (typeof facadeClass[method] === 'function') {
                return facadeClass[method].bind(facadeClass);
            }

            return (...args: any[]) => {
                return facadeClass.__call(method, args);
            };
        }
    });
} 