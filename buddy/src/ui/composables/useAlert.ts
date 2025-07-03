/**
 * useAlert - 全局警告提示组合式函数
 *
 * 提供简单易用的全局警告提示功能，基于 DaisyUI 的 alert 组件实现。
 * 统一了 Toast 和 Alert 的功能，提供轻量级消息提示和持久性警告。
 *
 * 智能关闭按钮逻辑：
 * - 没有设置 duration 或 duration = 0：显示关闭按钮（持久性提示）
 * - 设置了 duration > 0：不显示关闭按钮（自动关闭）
 * - 明确设置 closable：使用设置的值（覆盖智能逻辑）
 *
 * 使用示例：
 * ```typescript
 * // 引入全局实例
 * import { globalAlert } from '@/composables/useAlert'
 *
 * // 基本使用（显示关闭按钮，需要手动关闭）
 * globalAlert.alert('这是一条警告消息')
 * globalAlert.success('操作成功')
 *
 * // 不同类型的警告（显示关闭按钮）
 * globalAlert.error('发生错误')
 * globalAlert.warning('请注意')
 * globalAlert.info('这是一条提示信息')
 *
 * // 轻量级消息提示（自动关闭，无关闭按钮）
 * globalAlert.success('操作成功', { duration: 3000 })
 * globalAlert.toast('这是一条消息')  // 默认3秒自动关闭
 *
 * // 强制显示/隐藏关闭按钮
 * globalAlert.success('持久提示', { closable: true, duration: 5000 })   // 有关闭按钮且5秒后自动关闭
 * globalAlert.success('无按钮提示', { closable: false })  // 无关闭按钮且不自动关闭
 *
 * // 手动关闭
 * globalAlert.close()
 * ```
 *
 * 可用方法：
 * - alert(message | options): 显示普通警告
 * - toast(message | options): 显示轻量级消息（默认3秒自动关闭）
 * - success(message, options?): 显示成功消息
 * - error(message, options?): 显示错误消息
 * - warning(message, options?): 显示警告消息
 * - info(message, options?): 显示信息消息
 * - close(): 关闭当前显示的警告
 */

import { ref } from 'vue';

// Alert 状态接口
interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  closable: boolean;
  duration?: number;
  position:
    | 'top-start'
    | 'top-center'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-center'
    | 'bottom-end';
}

// 默认配置
const defaultOptions = {
  type: 'info' as const,
  message: '',
  closable: false,
  duration: undefined,
  position: 'top-center' as const,
};

// 创建一个全局状态
const state = ref<AlertState>({
  show: false,
  ...defaultOptions,
});

/**
 * Alert 警告提示 Composable
 * 提供全局警告提示功能
 */
export function useAlert() {
  /**
   * 显示 Alert 警告
   * @param options 配置选项或消息字符串
   */
  const alert = (options: Partial<Omit<AlertState, 'show'>> | string) => {
    // 如果传入的是字符串，则作为消息内容
    if (typeof options === 'string') {
      options = { message: options };
    }

    // 关闭之前的 Alert
    state.value.show = false;

    // 短暂延迟后显示新的 Alert，确保动画效果流畅
    setTimeout(() => {
      // 智能判断是否显示关闭按钮：
      // 1. 如果明确设置了 closable，使用设置的值
      // 2. 如果没有设置 duration 或 duration 为 0，默认显示关闭按钮
      // 3. 如果设置了 duration > 0，默认不显示关闭按钮（自动关闭）
      const shouldShowCloseButton =
        options.closable !== undefined
          ? options.closable
          : !options.duration || options.duration === 0;

      state.value = {
        ...state.value,
        ...defaultOptions,
        ...options,
        closable: shouldShowCloseButton,
        show: true,
      };

      // 如果有duration设置且大于0，自动关闭
      if (options.duration && options.duration > 0) {
        setTimeout(() => {
          state.value.show = false;
        }, options.duration);
      }
    }, 100);
  };

  /**
   * 显示轻量级消息提示（类似 Toast）
   * @param options 配置选项或消息字符串
   */
  const toast = (options: Partial<Omit<AlertState, 'show'>> | string) => {
    // 如果传入的是字符串，则作为消息内容
    if (typeof options === 'string') {
      options = { message: options, duration: 3000 };
    } else {
      // 默认给 Toast 添加自动关闭时间
      options = { duration: 3000, ...options };
    }

    alert(options);
  };

  /**
   * 显示成功消息
   * @param message 消息内容
   * @param options 其他配置选项
   */
  const success = (
    message: string,
    options: Partial<Omit<AlertState, 'show' | 'type' | 'message'>> = {}
  ) => {
    alert({
      type: 'success',
      message,
      ...options,
    });
  };

  /**
   * 显示错误消息
   * @param message 消息内容
   * @param options 其他配置选项
   */
  const error = (
    message: string,
    options: Partial<Omit<AlertState, 'show' | 'type' | 'message'>> = {}
  ) => {
    alert({
      type: 'error',
      message,
      ...options,
    });
  };

  /**
   * 显示警告消息
   * @param message 消息内容
   * @param options 其他配置选项
   */
  const warning = (
    message: string,
    options: Partial<Omit<AlertState, 'show' | 'type' | 'message'>> = {}
  ) => {
    alert({
      type: 'warning',
      message,
      ...options,
    });
  };

  /**
   * 显示信息消息
   * @param message 消息内容
   * @param options 其他配置选项
   */
  const info = (
    message: string,
    options: Partial<Omit<AlertState, 'show' | 'type' | 'message'>> = {}
  ) => {
    alert({
      type: 'info',
      message,
      ...options,
    });
  };

  /**
   * 关闭当前 Alert
   */
  const close = () => {
    state.value.show = false;
  };

  return {
    state,
    alert,
    toast,
    success,
    error,
    warning,
    info,
    close,
  };
}

// 创建一个全局实例
export const globalAlert = useAlert();

// 为了兼容性，保留 globalToast 别名
export const globalToast = globalAlert;
