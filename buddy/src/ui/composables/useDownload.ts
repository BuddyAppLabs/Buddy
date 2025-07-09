import { ref } from 'vue';
import { useMarketStore } from '@/ui/stores/market-store';
import { IPC_METHODS } from '@/types/ipc-methods';
import { globalAlert } from './useAlert';

const ipc = window.ipc;

export function useDownload() {
  const marketStore = useMarketStore();
  const downloadingPackages = ref<Set<string>>(new Set());
  const downloadedPackages = ref<Set<string>>(new Set());

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

      downloadedPackages.value.add(id);
      globalAlert.success('插件包下载成功');
    } else {
      throw new Error('下载插件包失败：' + response.error);
    }
  };

  // 检查插件安装状态
  const isPackageInstalled = async (id: string): Promise<boolean> => {
    const response = await ipc.invoke(IPC_METHODS.Plugin_Is_Installed, id);

    return response.data;
  };

  return {
    handleDownload,
    downloadingPackages,
    isPackageInstalled,
  };
}
