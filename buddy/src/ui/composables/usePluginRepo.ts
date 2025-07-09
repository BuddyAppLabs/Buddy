import { computed, ref } from 'vue';
import { useMarketStore } from '../stores/market-store';
import { marketIpc } from '../ipc/market-ipc';
import { useAlert } from './useAlert';

export function usePluginRepo() {
  const marketStore = useMarketStore();
  const devPlugins = computed(() => marketStore.devPlugins);

  const isLoading = ref(false);
  const { error } = useAlert();

  const disableDevRepo = async () => {
    await marketIpc.disableDevRepo();
    marketStore.loadDevPlugins();
  };

  const enableDevRepo = async () => {
    await marketIpc.enableDevRepo();
    marketStore.loadDevPlugins();
  };

  const resetDevPluginDir = async () => {
    await marketIpc.resetDevPluginDirectory();
  };

  const setDevPluginDir = async () => {
    try {
      const newPath = await marketIpc.setDevPluginDirectory();
      if (newPath) {
        marketStore.devPluginDirectory = newPath;
      }
    } catch (e) {
      error('设置开发插件目录失败: ' + e);
    }
  };

  return {
    devPlugins,
    isLoading,
    disableDevRepo,
    enableDevRepo,
    resetDevPluginDir,
    setDevPluginDir,
  };
}
