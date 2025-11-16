import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/ui/router/routes';

/**
 * 导航 Composable
 * 提供类型安全的路由导航函数
 * 使用命名路由常量而不是硬编码路径
 */
export function useNavigation() {
  const router = useRouter();

  // 跳转到首页
  const goToHome = () => {
    router.push({ name: ROUTE_NAMES.HOME });
  };

  // 跳转到 Hero 页面
  const goToHero = () => {
    router.push({ name: ROUTE_NAMES.HERO });
  };

  // 跳转到插件商店（默认本地仓库）
  const goToPluginStore = () => {
    router.push({ name: ROUTE_NAMES.MARKET_USER });
  };

  // 跳转到本地仓库
  const goToMarketUser = () => {
    router.push({ name: ROUTE_NAMES.MARKET_USER });
  };

  // 跳转到远程仓库
  const goToMarketRemote = () => {
    router.push({ name: ROUTE_NAMES.MARKET_REMOTE });
  };

  // 跳转到开发仓库
  const goToMarketDevRepo = () => {
    router.push({ name: ROUTE_NAMES.MARKET_DEV_REPO });
  };

  // 跳转到开发包
  const goToMarketDevPackage = () => {
    router.push({ name: ROUTE_NAMES.MARKET_DEV_PACKAGE });
  };

  // 跳转到设置
  const goToSettings = () => {
    router.push({ name: ROUTE_NAMES.SETTINGS });
  };

  // 跳转到 AI 设置
  const goToAISettings = () => {
    router.push({ name: ROUTE_NAMES.AI_SETTINGS });
  };

  // 跳转到 AI 聊天
  const goToAIChat = () => {
    router.push({ name: ROUTE_NAMES.AI_CHAT });
  };

  return {
    goToHome,
    goToHero,
    goToPluginStore,
    goToMarketUser,
    goToMarketRemote,
    goToMarketDevRepo,
    goToMarketDevPackage,
    goToSettings,
    goToAISettings,
    goToAIChat,
  };
}
