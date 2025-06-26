/**
 * 应用启动文件
 * 使用 Electron Laravel Framework
 * 负责应用的初始化和配置
 */

import { initializeRoutes } from '../routes/index.js';
import { app } from 'electron';
import {
    bootElectronApp,
    type ElectronAppConfig
} from '@coffic/cosy';
import { LogServiceProvider, KeyboardServiceProvider, MarketServiceProvider, McpServiceProvider, PluginServiceProvider, AppServiceProvider, Log } from '@coffic/buddy-foundation';
import { appManager } from '../managers/AppManager.js';
import { WindowServiceProvider } from '../providers/WindowServiceProvider.js';

// 应用配置
const config: ElectronAppConfig = {
    name: 'Buddy',
    version: '1.3.18',
    env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    debug: process.env.NODE_ENV !== 'production',
    providers: [
        LogServiceProvider,
        KeyboardServiceProvider,
        AppServiceProvider,
        PluginServiceProvider,
        WindowServiceProvider,
        McpServiceProvider,
        MarketServiceProvider
    ],
    middleware: {
        errorHandling: true,
        logging: true
    }
};

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
        Log.setApp(application);

        // 初始化新路由系统
        initializeRoutes();

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