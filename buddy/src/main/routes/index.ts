/**
 * 系统相关路由
 */

import { registerActionsRoutes } from './actions-route.js';
import { registerAIRoutes } from './ai-route.js';
import { registerCommonRoutes } from './common-route.js';
import { registerSettingRoutes } from './setting-route.js';
import { registerPluginRoutes } from './plugin-route.js';
import { registerStateRoutes } from './state-route.js';
import { registerIpcRoutes } from './ipc.js';

export function registerRoutes(): void {
  registerActionsRoutes();
  registerAIRoutes();
  registerCommonRoutes();
  registerSettingRoutes();
  registerPluginRoutes();
  registerStateRoutes();
  registerIpcRoutes();
}
