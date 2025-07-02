import EventEmitter from 'events';
import { ServiceContainer } from '../container/ServiceContainer';
import { ApplicationConfig } from '../application/ApplicationConfig';
import { ServiceProvider } from '../setting/ServiceProvider';

export interface IApplication extends EventEmitter {
  boot(): Promise<void>;
  run(): Promise<void>;
  container(): ServiceContainer;
  config(): ApplicationConfig;
  config<T>(key: keyof ApplicationConfig): T;
  isDevelopment(): boolean;
  isProduction(): boolean;
  isTest(): boolean;
  isBooted(): boolean;
  isRunning(): boolean;
  userDataPath(): string;
  shutdown(): Promise<void>;
  make<T>(abstract: string): T;
  bind<T>(
    abstract: string,
    factory: (container: ServiceContainer) => T,
    singleton?: boolean
  ): void;
  singleton<T>(
    abstract: string,
    factory: (container: ServiceContainer) => T
  ): void;
  register(provider: new (app: IApplication) => ServiceProvider): this;
}
