import { useRouter } from 'vue-router';
import { useAppStore } from '@/ui/stores/app-store';

export function useNavigation() {
  const router = useRouter();
  const appStore = useAppStore();

  // 跳转到插件商店
  const goToPluginStore = () => {
    router.push('/plugins');
    appStore.setView('plugins');
  };

  // 你可以继续添加其他常用跳转
  const goToHome = () => {
    router.push('/');
    appStore.setView('home');
  };

  const goToHero = () => {
    router.push('/hero');
    appStore.setView('hero');
  };

  return {
    goToPluginStore,
    goToHome,
    goToHero,
  };
}
