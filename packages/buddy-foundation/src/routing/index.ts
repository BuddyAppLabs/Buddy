/**
 * Buddy Foundation 路由系统
 * 提供类似Laravel的IPC路由功能
 */

// 核心类型
export * from './types';

// 核心类
export { Route } from './Route';
export { Router } from './Router';
export { Validator } from './Validator';

// 内置中间件
export * from './middleware';

// 导入Router类用于创建实例
import { Router } from './Router';

// 创建全局路由器实例
export const router = new Router(); 