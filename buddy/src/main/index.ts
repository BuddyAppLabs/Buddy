/**
 * Electron 主进程入口文件
 * 使用 Electron Laravel Framework 重构
 */
import { bootApplication } from './bootstrap/app.js';

// 启动应用
bootApplication().catch((error) => {
  console.error('❌ 应用启动失败:', error);
  process.exit(1);
});
