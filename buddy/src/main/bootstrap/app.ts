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
  ILogManager,
  setupIPCHandlers,
} from '@coffic/cosy-framework';
import { UpdateServiceProvider } from '@coffic/cosy-framework/update';
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
    UpdateServiceProvider,
    AIServiceProvider,
    PluginServiceProvider,
    WindowServiceProvider,
    McpServiceProvider,
    MarketServiceProvider,
  ],
  middleware: [LoggingMiddleware({ logLevel: 'debug' })],
};

/**
 * 启动应用
 */
export async function bootApplication(): Promise<void> {
  let logger: ILogManager | null = null;
  try {
    // 等待 Electron 准备就绪
    await app.whenReady();

    // 使用框架启动应用
    const application = await createElectronApp(config);

    // 从容器中获取日志管理器
    logger = application.make<ILogManager>('log.manager');
    console.log('logger', logger);

    // 监听应用的日志事件
    application.on('log', (level, message, context) => {
      logger?.channel('app')[level](message, context);
    });

    // 初始化Facades
    PluginFacade.setApp(application);

    // 等待插件系统初始化完成
    await PluginFacade.initialize();

    // 注册所有路由
    registerRoutes();

    setupIPCHandlers(application);

    logger.channel('app').info('✅ 应用核心服务已启动');
  } catch (error) {
    const errorMessage = '❌ Application failed to start';
    if (logger) {
      logger.channel('app').error(errorMessage, { error });
    } else {
      console.error(errorMessage, error);
    }
    throw error;
  }
}

// 设置应用事件监听
app.on('will-quit', async () => {
  console.log('👋 Buddy 应用正在关闭...');
});
