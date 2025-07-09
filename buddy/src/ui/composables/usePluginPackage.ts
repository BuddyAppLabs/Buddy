import { computed } from 'vue';
import { useMarketStore } from '../stores/market-store';
import { marketIpc } from '../ipc/market-ipc';

export function usePluginPackage() {
  const marketStore = useMarketStore();

  const devPackage = computed(() => marketStore.devPackage);

  const resetDevPackageDir = async () => {
    await marketIpc.resetDevPackageDirectory();
  };

  const setDevPackageDir = async () => {
    const newPath = await marketIpc.setDevPackageDirectory();
    if (newPath) {
      marketStore.devPackageDirectory = newPath;
    }
  };

  const disableDevPackage = async () => {
    await marketIpc.disableDevPackage();
    marketStore.loadDevPackage();
  };

  const enableDevPackage = async () => {
    await marketIpc.enableDevPackage();
    marketStore.loadDevPackage();
  };

  return {
    devPackage,
    resetDevPackageDir,
    setDevPackageDir,
    disableDevPackage,
    enableDevPackage,
  };
}
