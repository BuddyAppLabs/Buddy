import { ref } from 'vue';

// Alert 状态接口
interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
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
      state.value = {
        ...state.value,
        ...defaultOptions,
        ...options,
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
