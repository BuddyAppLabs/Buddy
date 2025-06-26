/**
 * Electron 应用启动助手
 */
import { ServiceProvider } from '../providers/ServiceProvider.js';
import { Application, ApplicationConfig } from '../application/Application.js';
import { Router } from '../router/Router.js';
import { LoggingMiddleware, ErrorHandlingMiddleware } from '../middleware/builtins.js';
import electron from 'electron';
import { EMOJI, IPC_CHANNELS } from '../constants.js';
import { ConfigServiceProvider } from '../config/ConfigServiceProvider.js';
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
    const defaultProviders = [
        ConfigServiceProvider,
    ];

    const finalConfig = {
        ...config,
        providers: [...defaultProviders, ...(config.providers || [])],
    };

    const app = Application.getInstance(finalConfig);

    // 注册全局中间件
    const router = Router.getInstance();

    if (config.middleware?.errorHandling !== false) {
        router.use(new ErrorHandlingMiddleware());
    }

    if (config.middleware?.logging !== false) {
        router.use(new LoggingMiddleware());
    }

    // 注册服务提供者
    if (finalConfig.providers) {
        finalConfig.providers.forEach(provider => {
            app.register(provider);
        });
    }

    return app;
}

/**
 * 启动 Electron 应用
 * @param config 应用配置
 */
// export async function bootElectronApp(config: ElectronAppConfig): Promise<Application> {
//     console.log(`${EMOJI} [Bootstrap] 启动 Electron 应用`);

//     const app = createElectronApp(config);

//     await app.boot();

//     console.log(`${EMOJI} [Bootstrap] 应用启动完成`);

//     // 设置 IPC 处理器
//     setupIPCHandlers();

//     await app.run();

//     return app;
// }

/**
 * 设置 IPC 处理器
 */
function setupIPCHandlers(): void {
    console.log(`${EMOJI} 设置 IPC 处理器`);
    const router = Router.getInstance();

    // 处理所有 IPC 调用
    ipcMain.handle(IPC_CHANNELS.DISPATCH, async (event, channel: string, args: any[]) => {
        return await router.dispatch(channel, args);
    });

    // 获取所有路由（用于调试）
    ipcMain.handle(IPC_CHANNELS.ROUTES, () => {
        const routes = router.getRoutes();
        return Array.from(routes.entries()).map(([channel, route]) => ({
            channel,
            name: route.name,
            middlewareCount: route.middleware.length,
        }));
    });
} 