/**
 * AI模块
 * 提供AI功能的统一访问接口
 */

// 导出契约
export * from './contracts/AIContract.js';

// 导出管理器
export { AIManager } from './AIManager.js';

// 导出服务提供者
export { AIServiceProvider } from './AIServiceProvider.js';

// 导出Facade
export { AI } from './facades/AI.js'; 