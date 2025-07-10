import { ref } from 'vue';
import { marketIpc } from '../ipc/market-ipc';
import { SendablePackage } from '@/types/sendable-package';
import { fileIpc } from '../ipc/file-ipc';

export function useDevPackage() {
  const devPackage = ref<SendablePackage | null>(null);
  const devPackageDirectory = ref<string>('');
  const isLoading = ref(false);

  const resetDevPackageDir = async () => {
    await marketIpc.resetDevPackageDirectory();
  };

  const setDevPackageDir = async () => {
    const newPath = await marketIpc.setDevPackageDirectory();
    if (newPath) {
      devPackageDirectory.value = newPath;
    }
  };

  const disableDevPackage = async () => {
    await marketIpc.disableDevPackage();

    devPackage.value = await marketIpc.getDevPackage();
  };

  const enableDevPackage = async () => {
    await marketIpc.enableDevPackage();
    devPackage.value = await marketIpc.getDevPackage();
  };

  const loadDevPackage = async () => {
    devPackage.value = await marketIpc.getDevPackage();
  };

  const updateDevPackageDirectory = async () => {
    devPackageDirectory.value = await marketIpc.getDevPackageDirectory();
  };

  const openDevPackageDirectory = async () => {
    await updateDevPackageDirectory();
    if (devPackageDirectory.value) {
      fileIpc.openFolder(devPackageDirectory.value);
    } else {
      console.error('当前插件目录不存在');
    }
  };
  return {
    isLoading,
    devPackage,
    openDevPackageDirectory,
    updateDevPackageDirectory,
    loadDevPackage,
    devPackageDirectory,
    resetDevPackageDir,
    setDevPackageDir,
    disableDevPackage,
    enableDevPackage,
  };
}
