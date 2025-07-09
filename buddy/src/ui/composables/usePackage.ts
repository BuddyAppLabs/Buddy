import { SendablePackage } from '@/types/sendable-package';
import { ref } from 'vue';
import { useMarketStore } from '@/ui/stores/market-store';
import { marketIpc } from '@/ui/ipc/market-ipc';

export function usePackage() {
  const marketStore = useMarketStore();
  const remotePackages = ref<SendablePackage[]>([]);

  // 加载远程插件包列表
  const loadRemotePackages = async () => {
    try {
      const plugins = await marketIpc.getRemotePackages();

      remotePackages.value = plugins;
    } finally {
      marketStore.loadingRemotePlugins = false;
    }
  };

  return {
    loadRemotePackages,
    remotePackages,
  };
}
