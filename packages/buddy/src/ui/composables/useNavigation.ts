import { useRouter } from 'vue-router';

export function useNavigation() {
  const router = useRouter();

  // 跳转到插件商店
  const goToPluginStore = () => {
    router.push('/plugins/user');
  };

  // 你可以继续添加其他常用跳转
  const goToHome = () => {
    router.push('/');
  };

  const goToHero = () => {
    router.push('/hero');
  };

  return {
    goToPluginStore,
    goToHome,
    goToHero,
  };
}
