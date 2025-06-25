/**
 * 公共类型定义
 */

// 重新导出核心类型
export type { ApplicationConfig } from '../application/Application.js';
export type { ServiceFactory } from '../container/ServiceContainer.js';
export type { IPCRequest, IPCResponse, NextFunction } from '../middleware/types.js';
export type { RouteDefinition, ControllerMethod } from '../router/Router.js';
export type { FacadeInterface } from '../facades/BaseFacade.js';
export type { ElectronAppConfig } from '../bootstrap/bootstrap.js'; 