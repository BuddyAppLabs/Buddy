/**
 * Electron 应用启动助手
 */
import { ServiceProvider } from '../providers/ServiceProvider.js';
import { Application, ApplicationConfig } from '../application/Application.js';
import { Router } from '../router/Router.js';
import { LoggingMiddleware, ErrorHandlingMiddleware } from '../middleware/builtins.js';
import electron from 'electron';
const { ipcMain } = electron;

export interface ElectronAppConfig extends ApplicationConfig {
    providers?: Array<new (app: Application) => ServiceProvider>;
    middleware?: {
        global?: boolean;
        logging?: boolean;
        errorHandling?: boolean;
    };
}

/**
 * 创建 Electron 应用
 * @param config 应用配置
 */
export function createElectronApp(config: ElectronAppConfig): Application {
    console.log('🚀 创建 Electron 应用');
    const app = Application.getInstance(config);

    // 注册全局中间件
    const router = Router.getInstance();

    if (config.middleware?.errorHandling !== false) {
        router.use(new ErrorHandlingMiddleware());
    }

    if (config.middleware?.logging !== false) {
        router.use(new LoggingMiddleware());
    }

    // 注册服务提供者
    if (config.providers) {
        config.providers.forEach(provider => {
            console.log('➕ 注册服务提供者', provider);
            app.register(provider);
        });
    }

    return app;
}

/**
 * 启动 Electron 应用
 * @param config 应用配置
 */
export async function bootElectronApp(config: ElectronAppConfig): Promise<Application> {
    const app = createElectronApp(config);

    await app.boot();

    // 设置 IPC 处理器
    setupIPCHandlers();

    await app.run();

    return app;
}

/**
 * 设置 IPC 处理器
 */
function setupIPCHandlers(): void {
    const router = Router.getInstance();

    // 处理所有 IPC 调用
    ipcMain.handle('electron-laravel-framework:dispatch', async (event, channel: string, args: any[]) => {
        return await router.dispatch(channel, args);
    });

    // 获取所有路由（用于调试）
    ipcMain.handle('electron-laravel-framework:routes', () => {
        const routes = router.getRoutes();
        return Array.from(routes.entries()).map(([channel, route]) => ({
            channel,
            name: route.name,
            middlewareCount: route.middleware.length,
        }));
    });
} 