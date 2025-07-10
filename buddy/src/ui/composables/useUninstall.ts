import { globalConfirm } from './useConfirm';
import { globalAlert } from './useAlert';
import { installedPackages } from './useDownload';
import { marketIpc } from '../ipc/market-ipc.js';
import { useLocal } from './useLocal';

export function useUninstall() {
  const { loadLocalPlugins } = useLocal();
  const uninstallingPlugins: Set<string> = new Set();

  // 卸载
  const executeUninstall = async (id: string) => {
    uninstallingPlugins.add(id);
    try {
      await marketIpc.uninstallPlugin(id);
      installedPackages.value.delete(id);
      await loadLocalPlugins();
      setTimeout(() => {
        globalAlert.success('插件已卸载', { duration: 3000 });
      }, 500);
      return true;
    } catch (err) {
      globalAlert.error('卸载失败' + err, { duration: 3000 });
      return false;
    }
  };

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
      executeUninstall(id);
    }
  };

  return {
    confirmUninstall,
    uninstallingPlugins,
  };
}
