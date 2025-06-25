/**
 * 应用启动文件
 * 使用 Electron Laravel Framework
 * 负责应用的初始化和配置
 */
import { app } from 'electron';
import {
    bootElectronApp,
    router,
    type ElectronAppConfig
} from '@coffic/electron-laravel-framework';
import { PluginServiceProvider } from '../providers/PluginServiceProvider.js';
import { AppServiceProvider } from '../providers/AppServiceProvider.js';
import { LogServiceProvider } from '../providers/LogServiceProvider.js';
import { Plugin } from '../facades/Plugin.js';
import { LogFacade } from '../facades/LogFacade.js';
import { WindowServiceProvider } from '../providers/WindowServiceProvider.js';
import { appManager } from '../managers/AppManager.js';
import { KeyServiceProvider } from '../providers/KeyServiceProvider.js';

// 应用配置
const config: ElectronAppConfig = {
    name: 'Buddy',
    version: '1.3.18',
    env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    debug: process.env.NODE_ENV !== 'production',
    providers: [
        LogServiceProvider,
        AppServiceProvider,
        PluginServiceProvider,
        WindowServiceProvider,
        KeyServiceProvider
    ],
    middleware: {
        errorHandling: true,
        logging: true
    }
};

// 注册路由
function registerRoutes(): void {
    console.log('🚀 registerRoutes');
    // 应用信息路由
    router.register('app:get-version', async () => {
        return {
            success: true,
            data: {
                version: config.version,
                name: config.name,
                env: config.env
            }
        };
    }).name('app.version');

    // 插件相关路由
    router.register('plugin:list', async () => {
        try {
            const plugins = await Plugin.getPlugins();
            return {
                success: true,
                data: plugins
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to get plugins'
            };
        }
    }).name('plugin.list');

    router.register('plugin:get', async (request) => {
        try {
            const [pluginId] = request.args;
            const plugin = await Plugin.getPlugin(pluginId);
            return {
                success: true,
                data: plugin
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to get plugin'
            };
        }
    }).name('plugin.get');

    router.register('plugin:execute', async (request) => {
        try {
            const [actionId, keyword] = request.args;
            const result = await Plugin.executeAction(actionId, keyword);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to execute action'
            };
        }
    }).name('plugin.execute');
}

/**
 * 启动应用
 */
export async function bootApplication(): Promise<void> {
    try {
        // 等待 Electron 准备就绪
        await app.whenReady();

        // 使用框架启动应用
        const application = await bootElectronApp(config);

        // 初始化Facades
        LogFacade.setApp(application);

        // 注册路由
        registerRoutes();

        // 启动应用管理器
        await appManager.start();

        console.log('🍋 Buddy 应用启动完成 (使用 Electron Laravel Framework)');
        console.log(`📝 环境: ${config.env}`);
        console.log(`🔧 调试模式: ${config.debug}`);
    } catch (error) {
        console.error('❌ 应用启动失败:', error);
        throw error;
    }
}

// 设置应用事件监听
app.on('will-quit', async () => {
    console.log('👋 Buddy 应用正在关闭...');
}); 