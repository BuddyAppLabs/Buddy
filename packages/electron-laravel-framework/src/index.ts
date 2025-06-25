/**
 * Electron Laravel Framework
 * Laravel-inspired framework for Electron applications
 */

// Application Core
export { Application, createApp, app } from './application/index.js';
export { ServiceContainer, container } from './container/index.js';

// Service Providers
export { ServiceProvider } from './providers/index.js';

// Router & Middleware
export { Router, router } from './router/index.js';
export {
    Middleware,
    LoggingMiddleware,
    ErrorHandlingMiddleware,
    ValidationMiddleware
} from './middleware/index.js';

// Facades
export { BaseFacade, createFacade } from './facades/index.js';

// Types
export type { ApplicationConfig } from './application/index.js';
export type { ServiceFactory } from './container/index.js';
export type { RouteDefinition, ControllerMethod } from './router/index.js';
export type {
    IPCRequest,
    IPCResponse,
    NextFunction
} from './middleware/index.js';
export type { FacadeInterface } from './facades/index.js';
export type { ElectronAppConfig } from './bootstrap/index.js';

// Bootstrap helpers
export { bootElectronApp, createElectronApp } from './bootstrap/index.js'; 