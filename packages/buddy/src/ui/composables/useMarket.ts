import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { useAlert } from './useAlert';
import { fileIpc } from '../ipc/file-ipc';
import { MarketTab } from '@/types/market-type';
import { useRemote } from './useRemote';
import { useLocal } from './useLocal';
import { useDevRepo } from './useDevRepo';
import { useDevPackage } from './useDevPackage';

export function useMarket() {
  const { loadRemotePackages } = useRemote();
  const { loadLocalPlugins } = useLocal();
  const { loadDevPlugins } = useDevRepo();
  const { error } = useAlert();
  const { devPackageDirectory, loadDevPackage } = useDevPackage();

  const isLoading = ref(false);
  const activeTab = ref<MarketTab>('user');

  const loadPlugins = async () => {
    if (isLoading.value) {
      console.log('loadPlugins is loading, skip');
      return;
    }

    isLoading.value = true;
    try {
      switch (activeTab.value) {
        case 'remote':
          await loadRemotePackages();
          break;
        case 'user':
          await loadLocalPlugins();
          break;
        case 'devRepo':
          await loadDevPlugins();
          break;
        case 'devPackage':
          console.log('loadDevPackage');
          await loadDevPackage();
          break;
        default:
          error('未知标签');
      }
    } catch (err) {
      error('刷新失败' + err);
    } finally {
      isLoading.value = false;
    }
  };

  // 卸载状态 (使用Map合并处理)
  const uninstallStates = useStorage('uninstall-states', {
    uninstallingPlugins: new Set<string>(),
    uninstallSuccess: new Set<string>(),
    uninstallError: new Map<string, string>(),
  });

  // 切换标签并加载对应插件
  const switchTab = (tab: MarketTab) => {
    activeTab.value = tab;
    loadPlugins();
  };

  // 清除单个插件的卸载错误状态
  const clearUninstallError = (pluginId: string) => {
    uninstallStates.value.uninstallError.delete(pluginId);
  };

  // 打开当前的插件目录
  const openCurrentPluginDirectory = () => {
    const currentDirectory = devPackageDirectory.value;
    if (currentDirectory) {
      fileIpc.openFolder(currentDirectory);
    } else {
      error('当前插件目录不存在');
    }
  };

  return {
    isLoading,
    loadPlugins,
    uninstallStates,
    switchTab,
    activeTab,
    clearUninstallError,
    openCurrentPluginDirectory,
  };
}
