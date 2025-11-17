import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/ui/router/routes';

const title = '[useNavigation]';

/**
 * 导航 Composable
 * 提供类型安全的路由导航函数
 * 使用命名路由常量而不是硬编码路径
 */
export function useNavigation() {
  const router = useRouter();

  // 跳转到搜索页面
  const goToSearch = () => {
    console.log(title, 'goToSearch');
    router.push({ name: ROUTE_NAMES.SEARCH });
    console.log(window.location.href);
  };

  // 跳转到 Hero 页面
  const goToHero = () => {
    console.log(title, 'goToHero');
    router.push({ name: ROUTE_NAMES.HERO });
    console.log(window.location.href);
  };

  // 跳转到插件商店（默认本地仓库）
  const goToPluginStore = () => {
    console.log(title, 'goToPluginStore');
    router.push({ name: ROUTE_NAMES.MARKET_USER });
    console.log(window.location.href);
  };

  // 跳转到本地仓库
  const goToMarketUser = () => {
    console.log(title, 'goToMarketUser');
    router.push({ name: ROUTE_NAMES.MARKET_USER });
    console.log(window.location.href);
  };

  // 跳转到远程仓库
  const goToMarketRemote = () => {
    console.log(title, 'goToMarketRemote');
    router.push({ name: ROUTE_NAMES.MARKET_REMOTE });
    console.log(window.location.href);
  };

  // 跳转到开发仓库
  const goToMarketDevRepo = () => {
    console.log(title, 'goToMarketDevRepo');
    router.push({ name: ROUTE_NAMES.MARKET_DEV_REPO });
    console.log(window.location.href);
  };

  // 跳转到开发包
  const goToMarketDevPackage = () => {
    console.log(title, 'goToMarketDevPackage');
    router.push({ name: ROUTE_NAMES.MARKET_DEV_PACKAGE });
    console.log(window.location.href);
  };

  // 跳转到设置
  const goToSettings = () => {
    console.log(title, 'goToSettings');
    router.push({ name: ROUTE_NAMES.SETTINGS });
    console.log(window.location.href);
  };

  // 跳转到 AI 设置
  const goToAISettings = () => {
    console.log(title, 'goToAISettings');
    router.push({ name: ROUTE_NAMES.AI_SETTINGS });
    console.log(window.location.href);
  };

  // 跳转到 AI 聊天
  const goToAIChat = () => {
    console.log(title, 'goToAIChat');
    router.push({ name: ROUTE_NAMES.AI_CHAT });
    console.log(window.location.href);
  };

  return {
    goToSearch,
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
