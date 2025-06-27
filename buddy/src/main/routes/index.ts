/**
 * 系统相关路由
 */

import { registerActionsRoutes } from './actions-route.js';
import { registerAIRoutes } from './ai-route.js';
import { registerCommonRoutes } from './common-route.js';
import { registerConfigRoutes } from './config-route.js';
import { registerMarketRoutes } from './market.js';
import { registerStateRoutes } from './state-route.js';
import { registerUpdateRoutes } from './update-route.js';
import { registerPluginRoutes } from './plugins-route.js';

export function registerRoutes(): void {
  registerActionsRoutes();
  registerAIRoutes();
  registerCommonRoutes();
  registerConfigRoutes();
  registerMarketRoutes();
  registerStateRoutes();
  registerUpdateRoutes();
  registerPluginRoutes();
}
