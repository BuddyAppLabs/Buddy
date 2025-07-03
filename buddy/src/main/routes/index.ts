import { registerActionsRoutes } from './actions-route.js';
import { registerCommonRoutes } from './common-route.js';
import { registerSettingRoutes } from './setting-route.js';
import { registerPluginRoutes } from './plugin-route.js';
import { registerStateRoutes } from './state-route.js';
import { registerIpcRoutes } from './ipc.js';
import { registerViewRoutes } from './view-route.js';

export function registerRoutes(): void {
  registerActionsRoutes();
  registerCommonRoutes();
  registerSettingRoutes();
  registerPluginRoutes();
  registerStateRoutes();
  registerIpcRoutes();
  registerViewRoutes();
}
