/**
 * Electron 应用启动助手
 */
import { ServiceProvider } from '../providers/ServiceProvider.js';
import { Application, ApplicationConfig } from '../application/Application.js';
import { Router } from '../routing/Router.js';
import { LoggingMiddleware, ErrorHandlingMiddleware } from '../routing/middleware/builtins.js';
import electron from 'electron';
import { EMOJI, IPC_CHANNELS } from '../constants.js';
import { ConfigServiceProvider } from '../config/ConfigServiceProvider.js';
import { Facade } from '../facades/Facade.js';
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
export async function createElectronApp(config: ElectronAppConfig): Promise<Application> {
    const defaultProviders = [
        ConfigServiceProvider,
    ];

    const finalConfig = {
        ...config,
        providers: [...defaultProviders, ...(config.providers || [])],
    };

    const app = Application.getInstance(finalConfig);

    Facade.setFacadeApplication(app);

    // 注册全局中间件
    const router = app.container().resolve<Router>('router');

    if (config.middleware?.errorHandling !== false) {
        router.use(ErrorHandlingMiddleware);
    }

    if (config.middleware?.logging !== false) {
        router.use(LoggingMiddleware);
    }

    // 注册服务提供者
    if (finalConfig.providers) {
        finalConfig.providers.forEach(provider => {
            app.register(provider);
        });
    }

    await app.boot();

    return app;
}

/**
 * 设置 IPC 处理器
 */
export function setupIPCHandlers(app: Application): void {
    console.log(`${EMOJI} [Bootstrap] 设置 IPC 处理器`);
    const router = app.container().resolve<Router>('router');
    console.log(router)
    console.log(`${EMOJI} [Bootstrap] 获取路由: ${router.getRoutes().size}`);

    // 处理所有 IPC 调用
    ipcMain.handle(IPC_CHANNELS.DISPATCH, async (event, channel: string, args: any[]) => {
        console.log(`${EMOJI} [Bootstrap] 处理 IPC 调用: ${channel}, 参数: ${JSON.stringify(args)}`);

        try {
            return await router.dispatch(channel, args);
        } catch (error) {
            console.error(`${EMOJI} ❌ [Bootstrap] 处理 IPC 调用失败: \n ${error} \n`);
            throw new Error(`${error}`);
        }
    });
} 