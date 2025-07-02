import { computed, ref } from 'vue';
import { useMarketStore } from '../stores/market-store';
import { useStorage } from '@vueuse/core';
import { useAlert } from './useAlert';
import { marketIpc } from '../ipc/market-ipc';
import { fileIpc } from '../ipc/file-ipc';
import { MarketTab } from '@/types/market-type';

export function useMarket() {
  const { error } = useAlert();

  const marketStore = useMarketStore();
  const userPlugins = computed(() => marketStore.userPlugins);
  const devPlugins = computed(() => marketStore.devPlugins);
  const remotePlugins = computed(() => marketStore.remotePlugins);

  const isLoading = ref(false);

  const setDevPluginDir = async () => {
    try {
      const newPath = await marketIpc.setDevPluginDirectory();
      if (newPath) {
        marketStore.devPluginDirectory = newPath;
        await loadPlugins(); // 重新加载插件
      }
    } catch (e) {
      error('设置开发插件目录失败: ' + e);
    }
  };

  const setDevPackageDir = async () => {
    const newPath = await marketIpc.setDevPackageDirectory();
    if (newPath) {
      marketStore.devPackageDirectory = newPath;
      await loadPlugins(); // 重新加载插件
    }
  };

  const resetDevPackageDir = async () => {
    await marketIpc.resetDevPackageDirectory();
    await loadPlugins();
  };

  const resetDevPluginDir = async () => {
    await marketIpc.resetDevPluginDirectory();
    await loadPlugins();
  };

  const loadPlugins = async () => {
    console.log('loadPlugins', marketStore.activeTab);
    if (isLoading.value) {
      console.log('loadPlugins is loading, skip');
      return;
    }

    isLoading.value = true;
    try {
      if (marketStore.activeTab === 'devRepo') {
        await marketStore.updateDevPluginDirectory();
      }

      if (marketStore.activeTab === 'devPackage') {
        await marketStore.updateDevPluginDirectory();
      }

      switch (marketStore.activeTab) {
        case 'remote':
          await marketStore.loadRemotePlugins();
          break;
        case 'user':
          await marketStore.loadUserPlugins();
          break;
        case 'devRepo':
          await marketStore.loadDevPlugins();
          break;
        case 'devPackage':
          console.log('loadDevPackage');
          await marketStore.loadDevPackage();
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

  // 简单使用Vue自带的computed
  const shouldShowEmpty = computed(() => {
    return (
      (marketStore.activeTab === 'remote' &&
        remotePlugins.value.length === 0) ||
      (marketStore.activeTab === 'user' && userPlugins.value.length === 0) ||
      (marketStore.activeTab === 'devRepo' && devPlugins.value.length === 0)
    );
  });

  // 卸载状态 (使用Map合并处理)
  const uninstallStates = useStorage('uninstall-states', {
    uninstallingPlugins: new Set<string>(),
    uninstallSuccess: new Set<string>(),
    uninstallError: new Map<string, string>(),
  });

  // 切换标签并加载对应插件
  const switchTab = (tab: MarketTab) => {
    marketStore.activeTab = tab;
    loadPlugins();
  };

  // 清除单个插件的卸载错误状态
  const clearUninstallError = (pluginId: string) => {
    uninstallStates.value.uninstallError.delete(pluginId);
  };

  // 打开当前的插件目录
  const openCurrentPluginDirectory = () => {
    let currentDirectory = marketStore.getCurrentPluginDirectory();
    if (currentDirectory) {
      fileIpc.openFolder(currentDirectory);
    } else {
      error('当前插件目录不存在');
    }
  };

  return {
    userPlugins,
    devPlugins,
    remotePlugins,
    isLoading,
    loadPlugins,
    shouldShowEmpty,
    uninstallStates,
    setDevPluginDir,
    setDevPackageDir,
    resetDevPackageDir,
    resetDevPluginDir,
    switchTab,
    clearUninstallError,
    uninstallPlugin: marketStore.uninstallPlugin,
    openCurrentPluginDirectory,
  };
}
