/**
 * 系统相关路由
 */

import { Application } from '@coffic/cosy-framework';
import { registerActionsRoutes } from './actions-route.js';
import { registerAIRoutes } from './ai-route.js';
import { registerCommonRoutes } from './common-route.js';
import { registerSettingRoutes } from './setting-route.js';
import { registerPluginRoutes } from './plugin-route.js';
import { registerStateRoutes } from './state-route.js';

export function registerRoutes(app: Application): void {
  registerActionsRoutes();
  registerAIRoutes();
  registerCommonRoutes();
  registerSettingRoutes();
  registerPluginRoutes(app);
  registerStateRoutes();
}
