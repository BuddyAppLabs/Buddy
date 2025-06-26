// Core Types
export type { ApplicationConfig } from './application/Application.js';
export type { ElectronAppConfig } from './bootstrap/bootstrap.js';

// Service Providers
export { ServiceProvider } from './providers/index.js';

// Application Core
export { Application, createApp, app } from './application/index.js';

// Container & Providers
export { ServiceContainer as Container, container } from './container/index.js';

// Bootstrap
export { createElectronApp, setupIPCHandlers } from './bootstrap/bootstrap.js';

// Config
export { Config } from './config/index.js';

// Router & Middleware
export * from './routing/index.js';
export {
    Middleware,
    LoggingMiddleware,
    ErrorHandlingMiddleware,
    ValidationMiddleware
} from './middleware/index.js';

// Facades
export { Facade } from './facades/Facade.js';
export { createFacade } from './facades/createFacade.js';

// Constants
export { IPC_CHANNELS } from './constants.js';

// Facades
export { RouteFacade } from './routing/facades/RouteFacade.js';