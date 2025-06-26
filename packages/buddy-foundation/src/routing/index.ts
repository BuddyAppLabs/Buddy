/**
 * Buddy Foundation 路由系统
 * 提供类似Laravel的IPC路由功能
 */

// 核心类型
export * from './types.js';

// 核心类
export { Route } from './Route.js';
export { Router } from './Router.js';
export { Validator } from './Validator.js';

// 内置中间件
export * from './middleware/index.js';

// 门面 (Facades)
export * from './facades/index.js';

// 导入Router类用于创建实例
import { Router } from './Router.js';

// 创建全局路由器实例
export const router = new Router(); 