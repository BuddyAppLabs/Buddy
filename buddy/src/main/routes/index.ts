/**
 * 系统相关路由
 */

import { registerActionsRoutes } from './actions.js';
import { registerAIRoutes } from './ai.js';
import { registerCommonRoutes } from './common.js';
import { registerConfigRoutes } from './config.js';
import { registerMarketRoutes } from './market.js';
import { registerStateRoutes } from './state.js';
import { registerUpdateRoutes } from './update.js';

export function registerRoutes(): void {
    registerActionsRoutes();
    registerAIRoutes();
    registerCommonRoutes();
    registerConfigRoutes();
    registerMarketRoutes();
    registerStateRoutes();
    registerUpdateRoutes();
} 