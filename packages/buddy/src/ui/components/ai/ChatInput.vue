<!--
  AI 聊天输入组件
  现代化设计的输入框，包含模型选择器和发送按钮
-->
<script setup lang="ts">
  import { ref, watch, nextTick, computed } from 'vue';
  import { SendIcon } from '@/ui/icons';

  interface Provider {
    type: string;
    name: string;
  }

  interface Model {
    id: string;
    name: string;
  }

  const props = defineProps<{
    input: string;
    isLoading: boolean;
    providers: Provider[];
    models: Model[];
    selectedProvider: string;
    selectedModel: string;
  }>();

  const emit = defineEmits<{
    'update:input': [value: string];
    'update:selectedProvider': [value: string];
    'update:selectedModel': [value: string];
    send: [];
    changeProvider: [provider: string];
  }>();

  const textareaRef = ref<HTMLTextAreaElement | null>(null);

  const handleSend = () => {
    if (!props.input.trim() || props.isLoading) return;
    emit('send');
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

  const handleInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    emit('update:input', target.value);
  };

  const autoResize = () => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
      textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
    }
  };

  const handleProviderChange = (provider: string) => {
    emit('update:selectedProvider', provider);
    emit('changeProvider', provider);
  };

  const getProviderModels = () => {
    return props.models.filter((m) =>
      m.id.startsWith(`${props.selectedProvider}/`)
    );
  };

  const canSend = computed(() => props.input.trim() && !props.isLoading);

  // 监听输入变化，自动调整高度
  watch(
    () => props.input,
    () => {
      nextTick(autoResize);
    }
  );
</script>

<template>
  <div class="p-4 border-t border-base-300 bg-base-100">
    <!-- 输入框区域 -->
    <div
      class="relative flex items-end gap-3 bg-base-200 rounded-2xl p-3 border-2 border-transparent transition-all focus-within:border-primary/30 mb-3">
      <textarea
        ref="textareaRef"
        :value="input"
        @input="handleInput"
        @keydown="handleKeydown"
        @keydown.stop
        @keyup.stop
        @keypress.stop
        placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
        class="flex-1 bg-transparent border-none resize-none text-base focus:outline-none placeholder:text-base-content/40 min-h-[44px] max-h-[200px] py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style="line-height: 1.5"
        rows="1"
        :disabled="isLoading"></textarea>

      <!-- 发送按钮 -->
      <button
        @click="handleSend"
        class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="
          canSend
            ? 'bg-primary text-primary-content hover:bg-primary/90 hover:scale-105 active:scale-95'
            : 'bg-base-300 text-base-content/40 hover:bg-base-300/80'
        "
        :disabled="!input.trim() || isLoading">
        <SendIcon v-if="!isLoading" class="w-5 h-5" />
        <span v-else class="loading loading-spinner loading-sm"></span>
      </button>
    </div>

    <!-- 模型选择栏 - 放在输入框下方 -->
    <div class="flex items-center gap-4 px-2 text-sm">
      <!-- 供应商选择 -->
      <div class="flex items-center gap-2">
        <label class="text-xs text-base-content/50 whitespace-nowrap">
          供应商
        </label>
        <div class="relative">
          <select
            :value="selectedProvider"
            @change="
              handleProviderChange(($event.target as HTMLSelectElement).value)
            "
            class="appearance-none bg-transparent border-none text-sm font-medium text-base-content cursor-pointer focus:outline-none hover:text-primary transition-colors pr-5 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading">
            <option
              v-for="provider in providers"
              :key="provider.type"
              :value="provider.type">
              {{ provider.name }}
            </option>
          </select>
          <svg
            class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-base-content/50"
            fill="currentColor"
            viewBox="0 0 12 12">
            <path d="M6 9L1 4h10z" />
          </svg>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="w-px h-3 bg-base-content/20"></div>

      <!-- 模型选择 -->
      <div class="flex items-center gap-2">
        <label class="text-xs text-base-content/50 whitespace-nowrap">
          模型
        </label>
        <div class="relative">
          <select
            :value="selectedModel"
            @change="
              emit(
                'update:selectedModel',
                ($event.target as HTMLSelectElement).value
              )
            "
            class="appearance-none bg-transparent border-none text-sm font-medium text-base-content cursor-pointer focus:outline-none hover:text-primary transition-colors pr-5 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading">
            <option
              v-for="model in getProviderModels()"
              :key="model.id"
              :value="model.id">
              {{ model.name }}
            </option>
          </select>
          <svg
            class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-base-content/50"
            fill="currentColor"
            viewBox="0 0 12 12">
            <path d="M6 9L1 4h10z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
