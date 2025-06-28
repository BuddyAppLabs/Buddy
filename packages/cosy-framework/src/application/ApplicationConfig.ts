import { Application } from './Application.js';
import { IMiddleware } from '../contract/IMiddleware.js';
import { ServiceProvider } from '../providers/ServiceProvider.js';

export interface ApplicationConfig {
  name: string;
  version: string;
  env: 'development' | 'production' | 'test';
  debug: boolean;
  providers?: Array<new (app: Application) => ServiceProvider>;
  middleware?: IMiddleware[];
}
