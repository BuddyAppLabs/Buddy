import { computed, ref } from 'vue';
import { IPC_METHODS } from '@/types/ipc-methods';
import { globalAlert } from './useAlert';
import { useLocal } from './useLocal';

const ipc = window.ipc;

const downloadingPackages = ref<Set<string>>(new Set());
export const installedPackages = ref<Set<string>>(new Set());

export function useDownload() {
  const { loadLocalPlugins } = useLocal();
  const downloadedPackages = ref<Set<string>>(new Set());

  // 下载插件包
  const handleDownload = async (id: string) => {
    if (downloadingPackages.value.has(id)) {
      globalAlert.error('插件包正在下载中，请稍后再试');
      return;
    }

    downloadingPackages.value.add(id);
    const response = await ipc.invoke(IPC_METHODS.DOWNLOAD_PLUGIN, id);

    if (response.success) {
      downloadingPackages.value.delete(id);
      await loadLocalPlugins();
      installedPackages.value.add(id);

      downloadedPackages.value.add(id);
      globalAlert.success('插件包下载成功', { duration: 3000 });
    } else {
      throw new Error('下载插件包失败：' + response.error);
    }
  };

  // 检查插件安装状态
  const checkInstallationStatus = async (id: string) => {
    if (installedPackages.value.has(id)) {
      return;
    }
    const response = await ipc.invoke(IPC_METHODS.Plugin_Is_Installed, id);
    if (response.data) {
      installedPackages.value.add(id);
    }
  };

  const isPackageInstalled = (id: string) => {
    return computed(() => installedPackages.value.has(id));
  };

  return {
    handleDownload,
    downloadingPackages,
    checkInstallationStatus,
    isPackageInstalled,
  };
}
