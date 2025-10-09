import { SendablePackage } from '@/types/sendable-package';
import { marketIpc } from '@/ui/ipc/market-ipc';
import { ref } from 'vue';

export function useRemote() {
  const remotePackages = ref<SendablePackage[]>([]);
  const loadingRemotePlugins = ref(false);

  // 加载远程插件包列表
  const loadRemotePackages = async () => {
    try {
      const plugins = await marketIpc.getRemotePackages();

      remotePackages.value = plugins;
    } finally {
      loadingRemotePlugins.value = false;
    }
  };

  return {
    loadRemotePackages,
    remotePackages,
  };
}
