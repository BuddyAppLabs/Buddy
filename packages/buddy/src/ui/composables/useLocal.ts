import { SendablePackage } from '@/types/sendable-package';
import { marketIpc } from '@/ui/ipc/market-ipc';
import { ref } from 'vue';
import { fileIpc } from '../ipc/file-ipc';

export function useLocal() {
  const localPackages = ref<SendablePackage[]>([]);
  const loadingPlugins = ref(false);
  const userPluginDirectory = ref<string>('');

  // 加载用户插件列表
  const loadLocalPlugins = async (): Promise<void> => {
    loadingPlugins.value = true;

    try {
      localPackages.value = await marketIpc.getUserPlugins();
      console.log('已加载用户插件列表', localPackages.value.length);
    } catch (err) {
      console.error('Failed to load plugins:', err);
      throw err;
    } finally {
      loadingPlugins.value = false;
    }
  };

  // 打开当前的插件目录
  const openLocalDirectory = async () => {
    await updateUserPluginDirectory();
    if (userPluginDirectory.value) {
      fileIpc.openFolder(userPluginDirectory.value);
    } else {
      console.error('当前插件目录不存在');
    }
  };

  // 更新用户插件目录
  const updateUserPluginDirectory = async () => {
    userPluginDirectory.value = await marketIpc.getUserPluginDirectory();
  };

  return {
    openLocalDirectory,
    updateUserPluginDirectory,
    loadLocalPlugins,
    localPackages,
    loadingPlugins,
  };
}
