import { useRouter } from 'vue-router';

export function useNavigation() {
  const router = useRouter();

  // 跳转到首页
  const goToHome = () => {
    router.push('/');
  };

  // 跳转到 Hero 页面
  const goToHero = () => {
    router.push('/hero');
  };

  // 跳转到插件商店（默认本地仓库）
  const goToPluginStore = () => {
    router.push('/plugins/user');
  };

  // 跳转到本地仓库
  const goToMarketUser = () => {
    router.push('/plugins/user');
  };

  // 跳转到远程仓库
  const goToMarketRemote = () => {
    router.push('/plugins/remote');
  };

  // 跳转到开发仓库
  const goToMarketDevRepo = () => {
    router.push('/plugins/dev-repo');
  };

  // 跳转到开发包
  const goToMarketDevPackage = () => {
    router.push('/plugins/dev-package');
  };

  // 跳转到设置
  const goToSettings = () => {
    router.push('/settings');
  };

  // 跳转到 AI 设置
  const goToAISettings = () => {
    router.push('/settings/ai');
  };

  // 跳转到 AI 聊天
  const goToAIChat = () => {
    router.push('/ai-chat');
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
