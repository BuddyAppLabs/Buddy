import { defineStore } from 'pinia';

const logger = console;

interface ErrorState {
  errors: Array<{
    id: string;
    message: string;
    type: 'error' | 'warning';
    timestamp: number;
  }>;
  isErrorModalVisible: boolean;
}

export const useErrorStore = defineStore('error', {
  state: (): ErrorState => ({
    errors: [],
    isErrorModalVisible: false,
  }),

  actions: {
    addError(error: Error | string, type: 'error' | 'warning' = 'error') {
      const message = error instanceof Error ? error.message : error;
      const id = Date.now().toString();

      // 记录到日志
      if (type === 'error') {
        logger.error('应用错误:', message);
      } else {
        logger.warn('应用警告:', message);
      }

      // 添加到错误列表
      this.errors.push({
        id,
        message,
        type,
        timestamp: Date.now(),
      });

      // 显示错误模态框
      this.isErrorModalVisible = true;
    },

    removeError(id: string) {
      this.errors = this.errors.filter((error) => error.id !== id);

      // 如果没有错误了，隐藏模态框
      if (this.errors.length === 0) {
        this.isErrorModalVisible = false;
      }
    },

    clearErrors() {
      this.errors = [];
      this.isErrorModalVisible = false;
    },
  },
});
