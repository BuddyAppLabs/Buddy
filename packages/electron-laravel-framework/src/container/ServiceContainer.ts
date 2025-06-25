/**
 * 服务容器 - 依赖注入容器
 * 参考 Laravel 的服务容器设计
 * 负责管理应用中所有服务的注册、解析和生命周期
 */

export type ServiceFactory<T = any> = (container: ServiceContainer) => T;
export type ServiceResolver<T = any> = () => T;

interface ServiceBinding<T = any> {
    factory: ServiceFactory<T>;
    singleton: boolean;
    instance?: T;
}

export class ServiceContainer {
    private static _instance: ServiceContainer;
    private bindings = new Map<string, ServiceBinding>();
    private aliases = new Map<string, string>();

    private constructor() { }

    public static getInstance(): ServiceContainer {
        if (!ServiceContainer._instance) {
            ServiceContainer._instance = new ServiceContainer();
        }
        return ServiceContainer._instance;
    }

    /**
     * 绑定服务到容器
     * @param abstract 服务标识符
     * @param factory 服务工厂函数
     * @param singleton 是否为单例
     */
    public bind<T>(
        abstract: string,
        factory: ServiceFactory<T>,
        singleton: boolean = false
    ): void {
        this.bindings.set(abstract, {
            factory,
            singleton,
        });
    }

    /**
     * 绑定单例服务
     * @param abstract 服务标识符
     * @param factory 服务工厂函数
     */
    public singleton<T>(abstract: string, factory: ServiceFactory<T>): void {
        this.bind(abstract, factory, true);
    }

    /**
     * 绑定实例
     * @param abstract 服务标识符
     * @param instance 服务实例
     */
    public instance<T>(abstract: string, instance: T): void {
        this.bindings.set(abstract, {
            factory: () => instance,
            singleton: true,
            instance,
        });
    }

    /**
     * 设置别名
     * @param alias 别名
     * @param abstract 实际服务标识符
     */
    public alias(alias: string, abstract: string): void {
        this.aliases.set(alias, abstract);
    }

    /**
     * 解析服务
     * @param abstract 服务标识符
     */
    public resolve<T>(abstract: string): T {
        // 检查别名
        const realAbstract = this.aliases.get(abstract) || abstract;

        const binding = this.bindings.get(realAbstract);
        if (!binding) {
            throw new Error(`Service [${abstract}] not found in container.`);
        }

        // 如果是单例且已有实例，直接返回
        if (binding.singleton && binding.instance) {
            return binding.instance;
        }

        // 创建新实例
        const instance = binding.factory(this);

        // 如果是单例，缓存实例
        if (binding.singleton) {
            binding.instance = instance;
        }

        return instance;
    }

    /**
     * 检查服务是否已绑定
     * @param abstract 服务标识符
     */
    public bound(abstract: string): boolean {
        const realAbstract = this.aliases.get(abstract) || abstract;
        return this.bindings.has(realAbstract);
    }

    /**
     * 创建门面代理
     * @param abstract 服务标识符
     */
    public createFacade<T extends object>(abstract: string): T {
        return new Proxy({} as T, {
            get: (target, prop) => {
                const service = this.resolve<any>(abstract);
                const value = service[prop];
                return typeof value === 'function' ? value.bind(service) : value;
            }
        }) as T;
    }
}

// 导出全局容器实例
export const container = ServiceContainer.getInstance(); 