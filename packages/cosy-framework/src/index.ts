/**
 * Cosy Framework 主入口文件
 * 导出所有公共 API
 */

// Application
export * from './application/Application.js';
export * from './application/ApplicationConfig.js';

// Service Provider
export * from './providers/ServiceProvider.js';

// Config
export * from './config/index.js';

// Container
export * from './container/index.js';

// Contract
export { IRouter } from './contract/router/IRouter.js';
export { IRouteRegistrar } from './contract/router/IRouteRegistrar.js';
export { IRouteConfig } from './contract/router/IRouteConfig.js';
export { IRouteGroup } from './contract/router/IRouteGroup.js';
export { IRouteMatch } from './contract/router/IRouteMatch.js';
export { IRouteHandler } from './contract/router/IRouteHandler.js';
export { IMiddleware } from './contract/IMiddleware.js';
export { ILogChannel } from './contract/logger/ILogChannel.js';
export { ILogChannelConfig } from './contract/logger/ILogChannelConfig.js';
export { IChannelFactory } from './contract/logger/IChannelFactory.js';
export { ILogDriver } from './contract/logger/ILogDriver.js';
export { ILogManager } from './contract/logger/ILogManager.js';
export { ILogContext } from './contract/logger/ILogContext.js';
export { ILogLevel } from './contract/logger/ILogLevel.js';
export { ILogConfig } from './contract/logger/ILogConfig.js';
export { IContextualLogger } from './contract/logger/IContextualLogger.js';

// Middleware
export { ErrorHandlingMiddleware } from './middleware/ErrorHandlingMiddleware.js';

// Facades
export * from './facades/Facade.js';
export { RouteFacade } from './routing/RouteFacade.js';
export { createFacade } from './facades/createFacade.js';
export { UpdateFacade } from './update/UpdateFacade.js';

// Bootstrap
export * from './bootstrap/bootstrap.js';

// Constants
export * from './constants.js';
