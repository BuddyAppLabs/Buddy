<!--
  AI 聊天页面
  完整页面版本的 AI 聊天界面
-->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAIChat } from '@/ui/composables/useAIChat';
import { ref, nextTick, watch } from 'vue';

const router = useRouter();
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
  changeProvider,
  getProviderModels,
} = useAIChat();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const messagesContainerRef = ref<HTMLDivElement | null>(null);

const handleSend = () => {
  if (!input.value.trim() || isLoading.value) return;
  sendMessage();
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  });
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
  }
};

watch(input, () => {
  nextTick(autoResize);
});

// 监听供应商变化，自动切换模型
watch(selectedProvider, (newProvider) => {
  changeProvider(newProvider);
});

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
    }
  });
}, { deep: true });
</script>

<template>
  <div class="fixed inset-0 top-20 bottom-10 flex flex-col bg-base-100">
    <!-- 顶部标题栏 -->
    <div class="flex items-center gap-3 p-4 border-b border-base-300">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6"
        >
          <path
            d="M12 2L9.19 8.63L2 11.38L9.19 14.13L12 21L14.81 14.13L22 11.38L14.81 8.63L12 2Z"
          />
        </svg>
        AI 聊天
      </h1>
      <div class="flex-1"></div>
      <button
        @click="clearMessages"
        class="btn btn-ghost btn-sm"
        :disabled="messages.length === 0"
      >
        清空对话
      </button>
    </div>

    <!-- 模型选择区域 -->
    <div class="p-4 border-b border-base-300 bg-base-200/50">
      <div class="flex gap-4 items-center">
        <div class="form-control flex-1">
          <label class="label">
            <span class="label-text text-xs">供应商</span>
          </label>
          <select
            v-model="selectedProvider"
            class="select select-bordered select-sm w-full"
            :disabled="isLoading"
          >
            <option
              v-for="provider in providers"
              :key="provider.type"
              :value="provider.type"
            >
              {{ provider.name }}
            </option>
          </select>
        </div>

        <div class="form-control flex-1">
          <label class="label">
            <span class="label-text text-xs">模型</span>
          </label>
          <select
            v-model="selectedModel"
            class="select select-bordered select-sm w-full"
            :disabled="isLoading"
          >
            <option v-for="model in getProviderModels()" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div ref="messagesContainerRef" class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">💬</div>
        <h2 class="text-2xl font-bold mb-2">开始对话</h2>
        <p class="text-base-content/60">
          向 AI 助手提问，获取帮助和建议
        </p>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="message in messages"
        :key="message.id"
        class="chat"
        :class="message.role === 'user' ? 'chat-end' : 'chat-start'"
      >
        <div class="chat-header mb-1">
          {{ message.role === 'user' ? '你' : 'AI' }}
        </div>
        <div
          class="chat-bubble"
          :class="
            message.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-info'
          "
        >
          <div
            v-for="(part, index) in message.parts"
            :key="index"
            class="whitespace-pre-wrap"
          >
            <span v-if="part.type === 'text'">{{ part.text }}</span>
          </div>
        </div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="isLoading" class="chat chat-start">
        <div class="chat-bubble chat-bubble-info">
          <span class="loading loading-dots loading-sm"></span>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="px-4 pb-2">
      <div class="alert alert-error">
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
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="px-4 pb-2">
      <div class="alert alert-success">
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

    <!-- 输入区域 -->
    <div class="p-4 border-t border-base-300 bg-base-200/50">
      <div class="flex gap-2">
        <textarea
          ref="textareaRef"
          v-model="input"
          @keydown="handleKeydown"
          @keydown.stop
          @keyup.stop
          @keypress.stop
          placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
          class="textarea textarea-bordered flex-1 resize-none min-h-[44px] max-h-[200px]"
          rows="1"
          :disabled="isLoading"
        ></textarea>
        <button
          @click="handleSend"
          class="btn btn-primary"
          :disabled="!input.trim() || isLoading"
        >
          <svg
            v-if="!isLoading"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path
              d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
            />
          </svg>
          <span v-else class="loading loading-spinner loading-sm"></span>
        </button>
      </div>
    </div>
  </div>
</template>
