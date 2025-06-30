import { computed, ref, onMounted } from 'vue';
import { useMarketStore } from '../stores/marketStore';
import { useStorage } from '@vueuse/core';
import { useAlert } from './useAlert';
import { globalToast } from './useToast';
import { marketIpc } from '../ipc/market-ipc';

export function useMarket() {
  const { error } = useAlert();
  const isDev = import.meta.env.DEV;

  const marketStore = useMarketStore();
  const userPlugins = computed(() => marketStore.userPlugins);
  const devPlugins = computed(() => marketStore.devPlugins);
  const remotePlugins = computed(() => marketStore.remotePlugins);
  const directory = computed(() => marketStore.userPluginDirectory);
  const devPluginDirectory = ref<string | null>(null);

  // 使用localStorage保存最后选择的标签
  const activeTab = useStorage<'user' | 'remote' | 'dev'>(
    'market-active-tab',
    'user'
  );

  const isLoading = ref(false);

  const fetchDevPluginDir = async () => {
    try {
      devPluginDirectory.value = await marketIpc.getDevPluginDirectory();
    } catch (e) {
      error('获取开发插件目录失败: ' + e);
    }
  };

  const setDevPluginDir = async () => {
    try {
      const newPath = await marketIpc.setDevPluginDirectory();
      if (newPath) {
        devPluginDirectory.value = newPath;
        globalToast.success('开发插件目录已更新');
        await loadPlugins(); // 重新加载插件
      }
    } catch (e) {
      error('设置开发插件目录失败: ' + e);
    }
  };

  const loadPlugins = async () => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      if (activeTab.value === 'dev') {
        await fetchDevPluginDir();
      }
      switch (activeTab.value) {
        case 'remote':
          await marketStore.loadRemotePlugins();
          break;
        case 'user':
          await marketStore.loadUserPlugins();
          break;
        case 'dev':
          await marketStore.loadDevPlugins();
          break;
        default:
          error('未知标签');
      }

      globalToast.success(`刷新成功(${activeTab.value})`, {
        duration: 2000,
        position: 'bottom-center',
      });
    } catch (err) {
      error('刷新失败' + err);
    } finally {
      isLoading.value = false;
    }
  };

  // 简单使用Vue自带的computed
  const shouldShowEmpty = computed(() => {
    return (
      (activeTab.value === 'remote' && remotePlugins.value.length === 0) ||
      (activeTab.value === 'user' && userPlugins.value.length === 0) ||
      (activeTab.value === 'dev' && devPlugins.value.length === 0)
    );
  });

  // 卸载状态 (使用Map合并处理)
  const uninstallStates = useStorage('uninstall-states', {
    uninstallingPlugins: new Set<string>(),
    uninstallSuccess: new Set<string>(),
    uninstallError: new Map<string, string>(),
  });

  // 刷新按钮点击事件
  const handleRefresh = () => {
    loadPlugins();
  };

  // 切换标签并加载对应插件
  const switchTab = (tab: 'user' | 'remote' | 'dev') => {
    activeTab.value = tab;
    loadPlugins();
  };

  // 清除单个插件的卸载错误状态
  const clearUninstallError = (pluginId: string) => {
    uninstallStates.value.uninstallError.delete(pluginId);
  };

  onMounted(() => {
    if (activeTab.value === 'dev') {
      fetchDevPluginDir();
    }
  });

  return {
    isDev,
    userPlugins,
    devPlugins,
    remotePlugins,
    directory,
    activeTab,
    isLoading,
    shouldShowEmpty,
    uninstallStates,
    devPluginDirectory,
    setDevPluginDir,
    handleRefresh,
    switchTab,
    clearUninstallError,
    uninstallPlugin: marketStore.uninstallPlugin,
  };
}
