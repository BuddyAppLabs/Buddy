<!--
  AI 设置向导
  帮助用户快速配置 API 密钥
-->
<script setup lang="ts">
import { ref } from 'vue';
import { aiIpc } from '@/ui/ipc/ai-ipc';

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const provider = ref('openai');
const apiKey = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const providers = [
  { value: 'openai', label: 'OpenAI (GPT-4, GPT-3.5)', url: 'https://platform.openai.com/api-keys' },
  { value: 'deepseek', label: 'DeepSeek', url: 'https://platform.deepseek.com/api_keys' },
  { value: 'anthropic', label: 'Anthropic (Claude)', url: 'https://console.anthropic.com/settings/keys' },
];

const handleSave = async () => {
  if (!apiKey.value.trim()) {
    error.value = '请输入 API 密钥';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const response = await aiIpc.setApiKey(provider.value, apiKey.value);
    
    if (response.success) {
      success.value = true;
      setTimeout(() => {
        emit('success');
        emit('close');
      }, 2000);
    } else {
      error.value = response.error || '保存失败';
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败';
  } finally {
    isLoading.value = false;
  }
};

const openProviderUrl = () => {
  const selectedProvider = providers.find(p => p.value === provider.value);
  if (selectedProvider) {
    window.open(selectedProvider.url, '_blank');
  }
};
</script>

<template>
  <div class="card bg-base-100 shadow-xl max-w-md">
    <div class="card-body">
      <h2 class="card-title">
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
        配置 AI API 密钥
      </h2>
      
      <div v-if="success" class="alert alert-success">
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
        <span>✅ 配置成功！正在关闭...</span>
      </div>

      <div v-else>
        <p class="text-sm text-base-content/70 mb-4">
          使用 AI 聊天功能需要配置 API 密钥。请选择提供商并输入您的密钥。
        </p>

        <!-- 提供商选择 -->
        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">选择 AI 提供商</span>
          </label>
          <select v-model="provider" class="select select-bordered w-full">
            <option v-for="p in providers" :key="p.value" :value="p.value">
              {{ p.label }}
            </option>
          </select>
        </div>

        <!-- API 密钥输入 -->
        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">API 密钥</span>
            <button
              @click="openProviderUrl"
              class="label-text-alt link link-primary"
            >
              获取密钥 →
            </button>
          </label>
          <input
            v-model="apiKey"
            type="password"
            placeholder="sk-..."
            class="input input-bordered w-full"
            :disabled="isLoading"
          />
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="alert alert-error mb-4">
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

        <!-- 操作按钮 -->
        <div class="card-actions justify-end">
          <button @click="emit('close')" class="btn btn-ghost" :disabled="isLoading">
            取消
          </button>
          <button
            @click="handleSave"
            class="btn btn-primary"
            :disabled="isLoading || !apiKey.trim()"
          >
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
            <span v-else>保存</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
