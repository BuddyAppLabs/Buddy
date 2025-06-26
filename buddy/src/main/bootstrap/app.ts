/**
 * 应用启动文件
 * 使用 Electron Laravel Framework
 * 负责应用的初始化和配置
 */

import { app } from 'electron';
import { appManager } from '../managers/AppManager.js';
import { registerRoutes } from '../routes/index.js';
import { LogServiceProvider, WindowServiceProvider, RouteServiceProvider, Plugin, KeyboardServiceProvider, AppServiceProvider, AIServiceProvider, PluginServiceProvider, McpServiceProvider, MarketServiceProvider, Log } from '@coffic/buddy-foundation';
import { ElectronAppConfig, Facade, createElectronApp } from '@coffic/cosy-framework';

// 应用配置
const config: ElectronAppConfig = {
    name: 'Buddy',
    version: '1.3.18',
    env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    debug: process.env.NODE_ENV !== 'production',
    providers: [
        LogServiceProvider,
        RouteServiceProvider, // 路由服务应该在基础服务之后注册
        KeyboardServiceProvider,
        AppServiceProvider,
        AIServiceProvider,
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
        const application = createElectronApp(config);

        Facade.setFacadeApplication(application);

        // 初始化Facades
        Log.setApp(application);
        Plugin.setApp(application);

        // 启动应用管理器
        // await appManager.start();

        // 等待插件系统初始化完成
        await Plugin.initialize();

        // 注册所有路由
        registerRoutes();

        // 输出路由信息
        // console.log("\n=== 已注册的路由 ===");
        // console.log(RouteFacade.listRoutes().join('\n'));
        // console.log("==================\n");

        console.log('✅ 应用启动完成');
        console.log(`  ➡️ 环境: ${config.env}`);
        console.log(`  ➡️ 调试模式: ${config.debug}`);
    } catch (error) {
        console.error('❌ 应用启动失败:', error);
        throw error;
    }
}

// 设置应用事件监听
app.on('will-quit', async () => {
    console.log('👋 Buddy 应用正在关闭...');
}); 