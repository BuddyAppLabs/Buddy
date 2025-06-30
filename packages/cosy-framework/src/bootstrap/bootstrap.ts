import { Application } from '../application/Application.js';
import { ApplicationConfig } from '../application/ApplicationConfig.js';
import { Router } from '../routing/Router.js';
import electron from 'electron';
import { EMOJI, IPC_CHANNELS } from '../constants.js';
import { ConfigServiceProvider } from '../config/ConfigServiceProvider.js';
import { Facade } from '../facades/Facade.js';
import { RouteServiceProvider } from '../routing/RouteServiceProvider.js';
import { ErrorHandlingMiddleware } from '../middleware/ErrorHandlingMiddleware.js';
import { IpcResponse } from '@coffic/buddy-types/contact/ipc-response.js';
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
  const router = app.container().resolve<Router>('router');

  // 处理所有 IPC 调用
  ipcMain.handle(
    IPC_CHANNELS.DISPATCH,
    async (event, channel: string, args: any[]): Promise<IpcResponse<any>> => {
      try {
        const result = await router.dispatch(channel, args, event);
        try {
          structuredClone(result);
        } catch (e) {
          console.error('❌ 路由返回了不可克隆的数据', channel);
          console.log('错误信息', e);
          console.log('返回数据', result);
          throw new Error(
            `IPC handler 返回了不可克隆的数据（如函数、class 实例、Electron 原生对象等），请只返回纯数据对象`
          );
        }

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        let message = error instanceof Error ? error.message : String(error);
        // 返回错误响应而不是抛出错误，避免Electron输出错误堆栈
        return {
          success: false,
          error: message,
        };
      }
    }
  );
}
