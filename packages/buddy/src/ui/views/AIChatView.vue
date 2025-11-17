<!--
  AI 聊天页面
  完整页面版本的 AI 聊天界面
-->
<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { useAIChat } from '@/ui/composables/useAIChat';
  import { ref, nextTick, watch } from 'vue';
  import { AIIcon, ErrorIcon, SuccessIcon } from '@/ui/icons';
  import ChatMessage from '@/ui/components/ai/messages/ChatMessage.vue';
  import ChatInput from '@/ui/components/ai/ChatInput.vue';

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

  const messagesContainerRef = ref<HTMLDivElement | null>(null);

  const handleSend = () => {
    sendMessage();
  };

  // 处理重新发送
  const handleResend = (message: any) => {
    // 将消息内容填入输入框
    const textParts = message.parts.filter((p: any) => p.type === 'text');
    if (textParts.length > 0) {
      input.value = textParts[0].text;
      // 自动发送
      sendMessage();
    }
  };

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
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @resend="handleResend" />

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
    <ChatInput
      v-model:input="input"
      v-model:selected-provider="selectedProvider"
      v-model:selected-model="selectedModel"
      :is-loading="isLoading"
      :providers="providers"
      :models="models"
      @send="handleSend"
      @change-provider="changeProvider" />
  </div>
</template>
