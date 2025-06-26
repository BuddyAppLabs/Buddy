/**
 * Buddy Foundation 配置服务提供者
 * 将配置系统集成到Cosy框架中
 */

import { ServiceProvider, Application } from '@coffic/cosy';
import { ConfigManager, ConfigLoaderOptions } from './types.js';
import { Manager } from './Manager.js';
import { Config } from './facades/Config.js';
import { join } from 'path';

export class ConfigServiceProvider extends ServiceProvider {
    /**
     * 注册配置服务
     */
    public register(): void {
        // 注册配置管理器
        this.app.singleton('config.manager', () => {
            return new Manager();
        });

        // 注册配置门面的管理器
        this.app.singleton('config', () => {
            const manager = this.app.make<ConfigManager>('config.manager');
            Config.setManager(manager);
            return manager;
        });

        // 注册配置助手函数到容器
        this.app.bind('config.helper', () => {
            return (key?: string, defaultValue?: any) => {
                const manager = this.app.make<ConfigManager>('config');
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
    public async boot(): Promise<void> {
        const manager = this.app.make<ConfigManager>('config');

        // 获取应用基础路径
        const basePath = this.getBasePath();

        // 配置加载选项
        const options: ConfigLoaderOptions = {
            configPath: join(basePath, 'config'),
            envPath: join(basePath, '.env'),
            cache: {
                enabled: process.env.NODE_ENV === 'production',
                path: join(basePath, 'bootstrap', 'cache', 'config.json'),
                version: '1.0.0'
            },
            strict: false
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
        // 从环境变量获取
        if (process.env.APP_BASE_PATH) {
            return process.env.APP_BASE_PATH;
        }

        // 使用当前工作目录
        return process.cwd();
    }
} 