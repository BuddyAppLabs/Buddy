import { SendablePackage } from '@/types/sendable-package';
import { ref } from 'vue';
import { useMarketStore } from '@/ui/stores/market-store';
import { marketIpc } from '@/ui/ipc/market-ipc';
import { IPC_METHODS } from '@/types/ipc-methods';
import { globalAlert } from './useAlert';

const ipc = window.ipc;

export function usePackage() {
  const marketStore = useMarketStore();
  const isInstalled = ref(false);
  const remotePackages = ref<SendablePackage[]>([]);
  const downloadingPackages = ref<Set<string>>(new Set());

  // 下载插件包
  const handleDownload = async (id: string) => {
    if (downloadingPackages.value.has(id)) {
      globalAlert.error('插件包正在下载中，请稍后再试');
      return;
    }

    downloadingPackages.value.add(id);
    const response = await ipc.invoke(IPC_METHODS.DOWNLOAD_PLUGIN, id);

    console.log('downloadPackage response', response);

    if (response.success) {
      downloadingPackages.value.delete(id);
      await marketStore.loadUserPlugins();

      isInstalled.value = true;
      globalAlert.success('插件包下载成功');
    } else {
      throw new Error('下载插件包失败：' + response.error);
    }
  };

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
    handleDownload,
    loadRemotePackages,
    remotePackages,
    downloadingPackages,
  };
}
