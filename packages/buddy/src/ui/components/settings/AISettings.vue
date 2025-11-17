<!--
  AI设置组件
-->
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { aiIpc } from '@/ui/ipc/ai-ipc';
  import {
    EyeIcon,
    EyeOffIcon,
    SuccessIcon,
    ErrorIcon,
    InfoIcon,
  } from '@/ui/icons';

  interface AIProvider {
    type: string;
    name: string;
    apiKey: string;
    url: string;
    description: string;
    models: Array<{ id: string; name: string }>;
  }

  const aiProviders = ref<AIProvider[]>([]);
  const isLoadingAI = ref(false);
  const isSavingAI = ref(false);
  const successMessage = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);
  const showKey = ref<Record<string, boolean>>({});

  // 加载AI供应商
  const loadAIProviders = async () => {
    isLoadingAI.value = true;
    try {
      const response = await aiIpc.getProviders();
      if (response.success && response.data) {
        let data = response.data;
        if (data && typeof data === 'object' && 'data' in data) {
          data = data.data;
        }

        if (Array.isArray(data)) {
          aiProviders.value = data.map((p: any) => ({
            type: p.type,
            name: p.name || p.type,
            apiKey: '',
            url: p.url || '',
            description: p.description || '',
            models: p.models || [],
          }));

          await loadApiKeys();
        }
      }
    } catch (e) {
      console.error('加载供应商失败:', e);
    } finally {
      isLoadingAI.value = false;
    }
  };

  // 加载API密钥
  const loadApiKeys = async () => {
    for (const provider of aiProviders.value) {
      try {
        const response = await aiIpc.getApiKey(provider.type);
        if (response.success && response.data) {
          let apiKey = response.data;
          if (apiKey && typeof apiKey === 'object' && 'data' in apiKey) {
            apiKey = apiKey.data;
          }
          provider.apiKey = apiKey ? String(apiKey) : '';
        }
      } catch (e) {
        console.error(`加载 ${provider.type} API 密钥失败:`, e);
      }
    }
  };

  // 保存API密钥
  const saveApiKey = async (provider: AIProvider) => {
    isSavingAI.value = true;
    errorMessage.value = null;

    try {
      const response = await aiIpc.setApiKey(provider.type, provider.apiKey);
      if (response.success) {
        successMessage.value = `${provider.name} API 密钥保存成功`;
        setTimeout(() => {
          successMessage.value = null;
        }, 3000);
      } else {
        errorMessage.value = response.error || '保存失败';
      }
    } catch (e) {
      errorMessage.value = e instanceof Error ? e.message : '保存失败';
    } finally {
      isSavingAI.value = false;
    }
  };

  // 打开获取密钥的网页
  const openProviderUrl = (url: string) => {
    window.open(url, '_blank');
  };

  // 切换显示/隐藏密钥
  const toggleShowKey = (type: string) => {
    showKey.value[type] = !showKey.value[type];
  };

  onMounted(() => {
    loadAIProviders();
  });
</script>

<template>
  <div>
    <!-- 帮助信息 - 移到顶部 -->
    <div class="alert alert-info mb-6">
      <InfoIcon class="stroke-current shrink-0 w-6 h-6" />
      <div>
        <h3 class="font-bold">💡 提示</h3>
        <div class="text-sm mt-1">
          <p>• API 密钥将安全地保存在本地</p>
          <p>• 至少配置一个供应商的密钥才能使用 AI 聊天功能</p>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="successMessage" class="alert alert-success mb-4">
      <SuccessIcon class="stroke-current shrink-0 h-6 w-6" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert alert-error mb-4">
      <ErrorIcon class="stroke-current shrink-0 h-6 w-6" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="isLoadingAI && aiProviders.length === 0"
      class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- AI 供应商列表 -->
    <div v-else class="space-y-6">
      <div
        v-for="provider in aiProviders"
        :key="provider.type"
        class="card bg-base-100 border border-base-300">
        <div class="card-body">
          <h3 class="card-title text-lg">
            {{ provider.name }}
            <div class="badge badge-primary badge-sm">
              {{ provider.models.length }} 个模型
            </div>
          </h3>
          <p class="text-sm text-base-content/70">
            {{ provider.description }}
          </p>

          <!-- API 密钥输入 -->
          <div class="form-control w-full mt-4">
            <label class="label">
              <span class="label-text font-medium">API 密钥</span>
              <button
                @click="openProviderUrl(provider.url)"
                class="label-text-alt link link-primary">
                获取密钥 →
              </button>
            </label>
            <div class="join w-full">
              <input
                v-model="provider.apiKey"
                :type="showKey[provider.type] ? 'text' : 'password'"
                placeholder="sk-..."
                class="input input-bordered join-item flex-1"
                :disabled="isSavingAI"
                @keydown.stop
                @keyup.stop
                @keypress.stop />
              <button
                @click="toggleShowKey(provider.type)"
                class="btn btn-square join-item"
                :disabled="isSavingAI">
                <EyeIcon v-if="showKey[provider.type]" class="w-5 h-5" />
                <EyeOffIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- 支持的模型 -->
          <div class="mt-2">
            <p class="text-xs text-base-content/60 mb-2">支持的模型：</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="model in provider.models"
                :key="model.id"
                class="badge badge-outline badge-sm">
                {{ model.name }}
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="card-actions justify-end mt-4">
            <button
              @click="saveApiKey(provider)"
              class="btn btn-primary btn-sm"
              :disabled="
                !provider.apiKey ||
                !String(provider.apiKey).trim() ||
                isSavingAI
              ">
              <span
                v-if="isSavingAI"
                class="loading loading-spinner loading-sm"></span>
              <span v-else>保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
