/**
 * Cosy Framework 主入口文件
 * 导出所有公共 API
 */

// Application
export { Application } from './application/Application.js';

// Service Provider
export { ServiceProvider } from './providers/ServiceProvider.js';

// Config
export * from './config/index.js';

// Container
export * from './container/index.js';

// Contract
export * from './contract/index.js';

// Middleware
export { AuthMiddleware } from './middleware/AuthMiddleware.js';
export { ErrorHandlingMiddleware } from './middleware/ErrorHandlingMiddleware.js';
export { LoggingMiddleware } from './middleware/LoggingMiddleware.js';
export { RateLimitMiddleware } from './middleware/RateLimitMiddleware.js';

// Facades
export { Facade } from './facades/Facade.js';
export { RouteFacade } from './routing/RouteFacade.js';
export { createFacade } from './facades/createFacade.js';

// Bootstrap
export { createElectronApp, setupIPCHandlers } from './bootstrap/bootstrap.js';

// Constants
export * from './constants.js';
