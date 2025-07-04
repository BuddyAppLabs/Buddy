import { Application } from './Application.js';
import { IMiddleware } from '../contract/IMiddleware.js';
import { ServiceProvider } from '../setting/ServiceProvider.js';

export interface ApplicationConfig {
  // 应用名称
  name: string;

  // 环境
  env: 'development' | 'production' | 'test';

  // 是否为调试模式，适用于需要调试框架内部运行情况的情况
  debug: boolean;

  // 路径
  paths: {
    // 用户数据路径
    userData: string;
  };

  // 服务提供者
  providers?: Array<new (app: Application) => ServiceProvider>;

  // 中间件
  middleware?: IMiddleware[];
}
