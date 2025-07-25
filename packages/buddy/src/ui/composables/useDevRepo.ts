import { ref } from 'vue';
import { marketIpc } from '../ipc/market-ipc';
import { useAlert } from './useAlert';
import { SendablePackage } from '@/types/sendable-package';
import { fileIpc } from '../ipc/file-ipc';

export function useDevRepo() {
  const devPlugins = ref<SendablePackage[]>([]);
  const devPluginDirectory = ref<string>('');

  const isLoading = ref(false);
  const { error } = useAlert();

  // 加载开发插件列表
  const loadDevPlugins = async (): Promise<void> => {
    isLoading.value = true;

    try {
      devPlugins.value = await marketIpc.getDevPlugins();
    } finally {
      isLoading.value = false;
    }
  };

  const disableDevRepo = async () => {
    await marketIpc.disableDevRepo();
    loadDevPlugins();
  };

  const enableDevRepo = async () => {
    await marketIpc.enableDevRepo();
    loadDevPlugins();
  };

  const resetDevPluginDir = async () => {
    await marketIpc.resetDevPluginDirectory();
  };

  const setDevPluginDir = async () => {
    try {
      const newPath = await marketIpc.setDevPluginDirectory();
      if (newPath) {
        devPluginDirectory.value = newPath;
      }
    } catch (e) {
      error('设置开发插件目录失败: ' + e);
    }
  };

  const refreshDevPluginDir = async () => {
    devPluginDirectory.value = await marketIpc.getDevPluginDirectory();
  };

  const openDevPluginDirectory = async () => {
    await refreshDevPluginDir();
    if (devPluginDirectory.value) {
      fileIpc.openFolder(devPluginDirectory.value);
    } else {
      console.error('当前插件目录不存在');
    }
  };
  return {
    devPlugins,
    devPluginDirectory,
    refreshDevPluginDir,
    isLoading,
    openDevPluginDirectory,
    loadDevPlugins,
    disableDevRepo,
    enableDevRepo,
    resetDevPluginDir,
    setDevPluginDir,
  };
}
