import { Application } from '../application/Application.js';
import { ApplicationConfig } from '../application/ApplicationConfig.js';
import { Router } from '../routing/Router.js';
import electron from 'electron';
import { EMOJI, IPC_CHANNELS } from '../constants.js';
import { ConfigServiceProvider } from '../config/ConfigServiceProvider.js';
import { Facade } from '../facades/Facade.js';
import { RouteServiceProvider } from '../routing/RouteServiceProvider.js';
import { ErrorHandlingMiddleware } from '../middleware/ErrorHandlingMiddleware.js';
const { ipcMain } = electron;

const defaultMiddleware = [ErrorHandlingMiddleware];

const defaultProviders = [ConfigServiceProvider, RouteServiceProvider];

/**
 * 创建 Electron 应用
 * @param config 应用配置
 */
export async function createElectronApp(
  config: ApplicationConfig
): Promise<Application> {
  const finalConfig = {
    ...config,
    providers: [...defaultProviders, ...(config.providers || [])],
    middleware: [...defaultMiddleware, ...(config.middleware || [])],
  };

  const app = Application.getInstance(finalConfig);

  Facade.setFacadeApplication(app);

  // 注册服务提供者
  if (finalConfig.providers) {
    finalConfig.providers.forEach((provider) => {
      app.register(provider);
    });
  }

  // 注册全局中间件
  const router = app.container().resolve<Router>('router');
  finalConfig.middleware.forEach((middleware) => {
    router.use(middleware);
  });

  await app.boot();

  return app;
}

/**
 * 设置 IPC 处理器
 */
export function setupIPCHandlers(app: Application): void {
  console.log(`${EMOJI} [Bootstrap] 设置 IPC 处理器`);
  const router = app.container().resolve<Router>('router');

  // 处理所有 IPC 调用
  ipcMain.handle(
    IPC_CHANNELS.DISPATCH,
    async (event, channel: string, args: any[]) => {
      console.log(
        `${EMOJI} [Bootstrap] 处理 IPC 调用: ${channel}, 参数: ${JSON.stringify(args)}`
      );

      try {
        return await router.dispatch(channel, args, event);
      } catch (error) {
        let message = error instanceof Error ? error.message : String(error);
        console.error(`${EMOJI} ❌ [Bootstrap] 处理 IPC 调用失败: ${message}`);
        // 返回错误响应而不是抛出错误，避免Electron输出错误堆栈
        return {
          success: false,
          error: message,
        };
      }
    }
  );
}
