import { useMarketStore } from '@/ui/composables/useUserPackage';
import { globalConfirm } from './useConfirm';
import { useAsyncState } from '@vueuse/core';
import { globalAlert } from './useAlert';
import { installedPackages } from './useDownload';

export function useUninstall() {
  const marketStore = useMarketStore();

  // 卸载状态管理
  const { state: isUninstalling, execute: executeUninstall } = useAsyncState(
    async (id: string) => {
      try {
        await marketStore.uninstallPlugin(id);
        installedPackages.value.delete(id);
        setTimeout(() => {
          globalAlert.success('插件已卸载', { duration: 3000 });
        }, 500);
        return true;
      } catch (err) {
        globalAlert.error('卸载失败' + err, { duration: 3000 });
        return false;
      }
    },
    false,
    { immediate: false }
  );

  // 显示卸载确认
  const confirmUninstall = async (id: string) => {
    if (id.length === 0) {
      globalAlert.error('要卸载的插件ID不能为空', { duration: 3000 });
      return;
    }

    if (typeof id !== 'string') {
      globalAlert.error('要卸载的插件ID必须是字符串', { duration: 3000 });
      return;
    }

    const confirmed = await globalConfirm.confirm({
      title: '卸载插件',
      message: '确定要卸载此插件吗？' + id,
      confirmText: '确认卸载',
    });

    if (confirmed) {
      executeUninstall(1000, id);
    }
  };

  return {
    confirmUninstall,
    isUninstalling,
  };
}
