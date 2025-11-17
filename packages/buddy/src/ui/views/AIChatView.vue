<!--
  AI 聊天页面
  完整页面版本的 AI 聊天界面
-->
<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { useAIChat } from '@/ui/composables/useAIChat';
  import { ref, nextTick, watch } from 'vue';
  import { AIIcon, ErrorIcon, SuccessIcon, SendIcon } from '@/ui/icons';

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
  watch(
    messages,
    () => {
      nextTick(() => {
        if (messagesContainerRef.value) {
          messagesContainerRef.value.scrollTop =
            messagesContainerRef.value.scrollHeight;
        }
      });
    },
    { deep: true }
  );
</script>

<template>
  <div class="fixed inset-0 top-20 bottom-10 flex flex-col bg-base-100">
    <!-- 顶部标题栏 -->
    <div class="flex items-center gap-3 p-4 border-b border-base-300">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <AIIcon class="w-6 h-6" />
        AI 聊天
      </h1>
      <div class="flex-1"></div>
      <button
        @click="clearMessages"
        class="btn btn-ghost btn-sm"
        :disabled="messages.length === 0">
        清空对话
      </button>
    </div>

    <!-- 消息列表 -->
    <div
      ref="messagesContainerRef"
      class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">💬</div>
        <h2 class="text-2xl font-bold mb-2">开始对话</h2>
        <p class="text-base-content/60">向 AI 助手提问，获取帮助和建议</p>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="message in messages"
        :key="message.id"
        class="chat"
        :class="message.role === 'user' ? 'chat-end' : 'chat-start'">
        <div class="chat-header mb-1">
          {{ message.role === 'user' ? '你' : 'AI' }}
        </div>
        <div
          class="chat-bubble"
          :class="
            message.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-info'
          ">
          <div
            v-for="(part, index) in message.parts"
            :key="index"
            class="whitespace-pre-wrap">
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
        <ErrorIcon class="stroke-current shrink-0 h-6 w-6" />
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="px-4 pb-2">
      <div class="alert alert-success">
        <SuccessIcon class="stroke-current shrink-0 h-6 w-6" />
        <span>{{ successMessage }}</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="p-4 border-t border-base-300">
      <div class="bg-base-200 rounded-2xl p-4 flex flex-col gap-3">
        <!-- 输入框 -->
        <textarea
          ref="textareaRef"
          v-model="input"
          @keydown="handleKeydown"
          @keydown.stop
          @keyup.stop
          @keypress.stop
          placeholder="说点什么..."
          class="bg-transparent border-none focus:outline-none resize-none text-base min-h-[44px] max-h-[200px] p-0"
          rows="1"
          :disabled="isLoading"></textarea>

        <!-- 底部工具栏 -->
        <div class="flex items-center justify-between">
          <!-- 模型选择器 -->
          <div class="flex items-center gap-3 text-sm text-base-content/70">
            <div class="flex items-center gap-2 whitespace-nowrap">
              <span>供应商:</span>
              <select
                v-model="selectedProvider"
                class="select select-ghost select-xs bg-transparent border-none focus:outline-none p-0 font-medium text-base-content"
                :disabled="isLoading">
                <option
                  v-for="provider in providers"
                  :key="provider.type"
                  :value="provider.type">
                  {{ provider.name }}
                </option>
              </select>
            </div>

            <span class="text-base-content/30">•</span>

            <div class="flex items-center gap-2 whitespace-nowrap">
              <span>模型:</span>
              <select
                v-model="selectedModel"
                class="select select-ghost select-xs bg-transparent border-none focus:outline-none p-0 font-medium text-base-content"
                :disabled="isLoading">
                <option
                  v-for="model in getProviderModels()"
                  :key="model.id"
                  :value="model.id">
                  {{ model.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- 发送按钮 -->
          <button
            @click="handleSend"
            class="btn btn-primary btn-circle btn-sm"
            :disabled="!input.trim() || isLoading">
            <SendIcon v-if="!isLoading" class="w-4 h-4" />
            <span v-else class="loading loading-spinner loading-xs"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
