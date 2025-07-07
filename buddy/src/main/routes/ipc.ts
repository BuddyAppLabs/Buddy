import { ipcMain } from 'electron';
import { LogFacade } from '@coffic/cosy-framework';

/**
 * 注册所有 IPC 事件监听器
 */
export function registerIpcRoutes(): void {
  /**
   * 处理来自插件视图的日志记录请求
   *
   * @param event - IPC 事件对象
   * @param level - 日志级别 ('info', 'warn', 'error')
   * @param args - 日志内容
   */
  ipcMain.on(
    'plugin:log',
    (event, level: 'info' | 'warn' | 'error', ...args: any[]) => {
      // `event.sender` 是发送消息的 WebContents
      // 我们可以用它的 id 来识别是哪个插件视图在打日志
      const viewId = event.sender.id;

      // 获取一个日志通道，可以为插件创建一个专用的通道
      const logger = LogFacade.channel('pluginView');

      // 根据插件传来的日志级别，调用相应的方法
      // 将上下文信息作为最后一个对象参数传递
      const context = { viewId, from: 'pluginView' };
      switch (level) {
        case 'info':
          logger.info(...args, context);
          break;
        case 'warn':
          logger.warn(...args, context);
          break;
        case 'error':
          logger.error(...args, context);
          break;
        default:
          // 对于未知的级别，可以记录为调试信息
          const exhaustiveCheck: never = level;
          logger.debug(
            `Unknown log level: ${exhaustiveCheck}`,
            ...args,
            context
          );
      }
    }
  );

  // 未来可以继续在这里添加更多的 IPC 监听器
  // ipcMain.on('plugin:other-action', (event, ...args) => { ... });
}
