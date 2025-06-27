/**
 * 应用启动文件
 * 使用 Electron Laravel Framework
 * 负责应用的初始化和配置
 */

import { app } from 'electron';
import { registerRoutes } from '../routes/index.js';
import { LoggingMiddleware, LogServiceProvider } from '@coffic/cosy-logger';
import {
  ApplicationConfig,
  createElectronApp,
  setupIPCHandlers,
} from '@coffic/cosy-framework';
import { KeyboardServiceProvider } from '@coffic/cosy-keyboard';
import { AIServiceProvider } from '../providers/ai/AIServiceProvider.js';
import { McpServiceProvider } from '../providers/mcp/McpServiceProvider.js';
import { MarketServiceProvider } from '../providers/market/MarketServiceProvider.js';
import { PluginServiceProvider } from '../providers/plugin/PluginServiceProvider.js';
import { PluginFacade } from '../providers/plugin/PluginFacade.js';
import { WindowServiceProvider } from '../providers/window/WindowServiceProvider.js';

// 应用配置
const config: ApplicationConfig = {
  name: 'Buddy',
  version: '1.3.18',
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    LogServiceProvider,
    KeyboardServiceProvider,
    AIServiceProvider,
    PluginServiceProvider,
    WindowServiceProvider,
    McpServiceProvider,
    MarketServiceProvider,
  ],
  middleware: [LoggingMiddleware()],
};

/**
 * 启动应用
 */
export async function bootApplication(): Promise<void> {
  try {
    // 等待 Electron 准备就绪
    await app.whenReady();

    // 使用框架启动应用
    const application = await createElectronApp(config);

    // 初始化Facades
    PluginFacade.setApp(application);

    // 等待插件系统初始化完成
    await PluginFacade.initialize();

    // 注册所有路由
    registerRoutes();

    setupIPCHandlers(application);

    console.log('✅ 应用启动完成');
  } catch (error) {
    console.error('❌ 应用启动失败:', error);
    throw error;
  }
}

// 设置应用事件监听
app.on('will-quit', async () => {
  console.log('👋 Buddy 应用正在关闭...');
});
