/**
 * 路由名称常量
 * 集中管理所有路由名称，避免硬编码
 */
export const ROUTE_NAMES = {
  HOME: 'home',
  HERO: 'hero',
  MARKET_USER: 'market-user',
  MARKET_REMOTE: 'market-remote',
  MARKET_DEV_REPO: 'market-dev-repo',
  MARKET_DEV_PACKAGE: 'market-dev-package',
  SETTINGS: 'settings',
  AI_SETTINGS: 'ai-settings',
  AI_CHAT: 'ai-chat',
} as const;

/**
 * 路由名称类型
 */
export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];
