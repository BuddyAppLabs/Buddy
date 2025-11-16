<!--
  AI 聊天面板
  使用 AI SDK 实现流式聊天界面
-->
<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAIChat } from '@/ui/composables/useAIChat';

const router = useRouter();

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const messagesContainer = ref<HTMLElement | null>(null);

const {
  messages,
  input,
  isLoading,
  error,
  successMessage,
  providers,
  models,
  selectedProvider,
  selectedModel,
  sendMessage,
  clearMessages,
  retry,
  changeProvider,
  getProviderModels,
} = useAIChat({
  initialModel: 'gpt-4o',
});

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// 监听消息变化，自动滚动
watch(
  () => messages.value.length,
  () => {
    scrollToBottom();
  }
);

watch(
  () => messages.value[messages.value.length - 1]?.content,
  () => {
    scrollToBottom();
  }
);

const handleSend = () => {
  sendMessage();
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

const handleClose = () => {
  emit('close');
};

const handleClear = () => {
  if (confirm('确定要清空对话历史吗？')) {
    clearMessages();
  }
};

const showHelp = () => {
  alert(
    '💡 AI 聊天帮助\n\n' +
      '如果无法正常使用，请检查：\n\n' +
      '1. API 密钥配置\n' +
      '   点击设置按钮配置 API 密钥\n\n' +
      '2. 获取 API 密钥\n' +
      '   OpenAI: https://platform.openai.com/api-keys\n' +
      '   DeepSeek: https://platform.deepseek.com/api_keys\n\n' +
      '3. 查看详细日志\n' +
      '   打开终端查看错误信息\n\n' +
      '更多帮助请查看 AI_SETUP.md 文件'
  );
};

const goToSettings = () => {
  emit('close');
  router.push('/settings/ai');
};
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="handleClose"
  >
    <div
      class="bg-base-100 rounded-lg shadow-2xl w-full max-w-3xl h-[600px] flex flex-col m-4"
      @click.stop
    >
      <!-- 头部 -->
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-base-300"
      >
        <div class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5 text-primary"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
            />
          </svg>
          <h2 class="text-lg font-semibold">AI 助手</h2>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="goToSettings"
            class="btn btn-ghost btn-sm"
            title="AI 设置"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-4 h-4"
            >
              <path
                d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
              />
            </svg>
          </button>
          <button
            @click="showHelp"
            class="btn btn-ghost btn-sm"
            title="帮助"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-4 h-4"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
              />
            </svg>
          </button>
          <button
            @click="handleClear"
            class="btn btn-ghost btn-sm"
            title="清空对话"
            :disabled="messages.length === 0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-4 h-4"
            >
              <path
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              />
            </svg>
          </button>
          <button
            @click="handleClose"
            class="btn btn-ghost btn-sm btn-circle"
            title="关闭"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-5 h-5"
            >
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 成功提示 -->
      <div
        v-if="successMessage"
        class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div class="alert alert-success shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </div>

      <!-- 消息列表 -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- 空状态 -->
        <div
          v-if="messages.length === 0"
          class="flex flex-col items-center justify-center h-full text-base-content/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-16 h-16 mb-4 opacity-50"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
            />
          </svg>
          <p class="text-lg">开始与 AI 助手对话</p>
          <p class="text-sm mt-2">输入你的问题，我会尽力帮助你</p>
        </div>

        <!-- 消息 -->
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] rounded-lg px-4 py-2"
            :class="
              message.role === 'user'
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 text-base-content'
            "
          >
            <div class="whitespace-pre-wrap wrap-break-word">
              {{ message.content }}
            </div>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-base-200 rounded-lg px-4 py-3">
            <div class="flex items-center gap-3">
              <span class="loading loading-dots loading-sm"></span>
              <div>
                <div class="text-sm font-medium text-base-content/90">
                  AI 正在思考...
                </div>
                <div class="text-xs text-base-content/60 mt-1">
                  这可能需要几秒钟
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="alert alert-error shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="flex-1">
            <div class="font-bold">❌ 发送失败</div>
            <div class="text-sm mt-1">{{ error }}</div>
            <div class="text-xs mt-2 opacity-70">
              💡 提示：请确保已配置有效的 API 密钥
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="retry" class="btn btn-sm btn-ghost">
              🔄 重试
            </button>
            <button @click="error = null" class="btn btn-sm btn-ghost">
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="border-t border-base-300 p-4">
        <!-- 模型选择器 -->
        <div v-if="providers.length > 0 && models.length > 0" class="flex items-center gap-3 mb-3 text-sm bg-base-200 rounded-lg p-2">
          <div class="flex items-center gap-2">
            <span class="text-base-content/70 font-medium">供应商:</span>
            <select
              v-model="selectedProvider"
              @change="changeProvider(selectedProvider)"
              class="select select-bordered select-sm bg-base-100"
              :disabled="isLoading"
            >
              <option v-for="provider in providers" :key="provider.type" :value="provider.type">
                {{ provider.name || provider.type }}
              </option>
            </select>
          </div>
          
          <div class="w-px h-6 bg-base-300"></div>
          
          <div class="flex items-center gap-2 flex-1">
            <span class="text-base-content/70 font-medium">模型:</span>
            <select
              v-model="selectedModel"
              class="select select-bordered select-sm bg-base-100 flex-1"
              :disabled="isLoading"
            >
              <option v-for="model in getProviderModels()" :key="model.id" :value="model.id">
                {{ model.name }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- 加载提示 -->
        <div v-else class="flex items-center gap-2 mb-3 text-sm text-base-content/60">
          <span class="loading loading-spinner loading-xs"></span>
          <span>正在加载模型列表...</span>
        </div>

        <!-- 输入区域 -->
        <div class="flex gap-2">
          <textarea
            v-model="input"
            @keydown="handleKeydown"
            placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            class="textarea textarea-bordered flex-1 resize-none"
            rows="2"
            :disabled="isLoading"
          ></textarea>
          <button
            @click="handleSend"
            class="btn btn-primary"
            :disabled="!input.trim() || isLoading"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-5 h-5"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
