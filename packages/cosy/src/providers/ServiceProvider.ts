/**
 * 服务提供者基类
 * 参考 Laravel ServiceProvider 设计
 * 提供服务注册、启动和关闭的生命周期管理
 */
import type { Application } from '../application/Application.js';

export abstract class ServiceProvider {
    protected app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    /**
     * 注册服务到容器
     * 此方法在应用启动时被调用，用于绑定服务到容器
     */
    public abstract register(): void;

    /**
     * 启动服务
     * 此方法在所有服务注册完成后被调用，用于执行依赖其他服务的初始化逻辑
     */
    public boot?(): void | Promise<void>;

    /**
     * 关闭服务
     * 此方法在应用关闭时被调用，用于清理资源
     */
    public shutdown?(): void | Promise<void>;

    /**
     * 延迟加载支持 - 返回此提供者提供的服务列表
     * 当返回非空数组时，此提供者将被标记为延迟加载
     */
    public provides(): string[] {
        return [];
    }

    /**
     * 是否为延迟提供者
     */
    public isDeferred(): boolean {
        return this.provides().length > 0;
    }
} 