<!--
  AI 设置页面
  配置各个 AI 供应商的 API 密钥
-->
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { aiIpc } from '@/ui/ipc/ai-ipc';

  interface Provider {
    type: string;
    name: string;
    apiKey: string;
    url: string;
    description: string;
    models: Array<{ id: string; name: string }>;
  }

  const providers = ref<Provider[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const successMessage = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);

  // 加载供应商和 API 密钥
  const loadProviders = async () => {
    isLoading.value = true;
    try {
      const response = await aiIpc.getProviders();
      console.log('[AISettingsView] 供应商响应:', response);
      if (response.success && response.data) {
        let data = response.data;
        if (data && typeof data === 'object' && 'data' in data) {
          data = data.data;
        }

        if (Array.isArray(data)) {
          console.log('[AISettingsView] 供应商数据:', data);
          // 直接使用后端返回的完整数据，不再使用硬编码的providerInfo
          providers.value = data.map((p: any) => ({
            type: p.type,
            name: p.name || p.type,
            apiKey: '', // 从设置中加载
            url: p.url || '',
            description: p.description || '',
            models: p.models || [],
          }));

          console.log(
            '[AISettingsView] 处理后的供应商:',
            providers.value.map((p) => p.type)
          );

          // 加载已保存的 API 密钥
          await loadApiKeys();
        }
      }
    } catch (e) {
      console.error('加载供应商失败:', e);
      errorMessage.value = '加载供应商列表失败';
    } finally {
      isLoading.value = false;
    }
  };

  // 加载已保存的 API 密钥
  const loadApiKeys = async () => {
    for (const provider of providers.value) {
      try {
        const response = await aiIpc.getApiKey(provider.type);
        if (response.success && response.data) {
          provider.apiKey = String(response.data);
        }
      } catch (e) {
        console.error(`加载 ${provider.type} API 密钥失败:`, e);
      }
    }
  };

  // 保存 API 密钥
  const saveApiKey = async (provider: Provider) => {
    isSaving.value = true;
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
      isSaving.value = false;
    }
  };

  // 测试 API 密钥
  const testApiKey = async (provider: Provider) => {
    if (!provider.apiKey || !String(provider.apiKey).trim()) {
      errorMessage.value = '请先输入 API 密钥';
      return;
    }

    isLoading.value = true;
    errorMessage.value = null;

    try {
      // 先保存密钥
      await saveApiKey(provider);

      // 发送测试消息
      const response = await aiIpc.sendMessage(
        provider.models[0]?.id || 'gpt-4o',
        [{ role: 'user', content: '你好' }]
      );

      if (response.success) {
        successMessage.value = `${provider.name} API 密钥测试成功！`;
        setTimeout(() => {
          successMessage.value = null;
        }, 3000);
      } else {
        errorMessage.value = `测试失败: ${response.error}`;
      }
    } catch (e) {
      errorMessage.value = e instanceof Error ? e.message : '测试失败';
    } finally {
      isLoading.value = false;
    }
  };

  // 打开获取密钥的网页
  const openProviderUrl = (url: string) => {
    window.open(url, '_blank');
  };

  // 显示/隐藏密钥
  const showKey = ref<Record<string, boolean>>({});
  const toggleShowKey = (type: string) => {
    showKey.value[type] = !showKey.value[type];
  };

  onMounted(() => {
    loadProviders();
  });
</script>

<template>
  <div class="h-full overflow-y-auto p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 标题 -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-2">
          <button
            @click="$router.push('/settings')"
            class="btn btn-ghost btn-sm btn-circle"
            title="返回设置">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-5 h-5">
              <path
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-7 h-7">
              <path
                d="M12 2L9.19 8.63L2 11.38L9.19 14.13L12 21L14.81 14.13L22 11.38L14.81 8.63L12 2Z" />
            </svg>
            AI 设置
          </h1>
        </div>
        <p class="text-base-content/70 ml-12">
          配置各个 AI 供应商的 API 密钥，开始使用 AI 聊天功能
        </p>
      </div>

      <!-- 成功提示 -->
      <div v-if="successMessage" class="alert alert-success mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="alert alert-error mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- 加载状态 -->
      <div
        v-if="isLoading && providers.length === 0"
        class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <!-- 供应商列表 -->
      <div v-else class="space-y-6">
        <div
          v-for="provider in providers"
          :key="provider.type"
          class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <!-- 供应商标题 -->
            <h2 class="card-title">
              {{ provider.name }}
              <div class="badge badge-primary badge-sm">
                {{ provider.models.length }} 个模型
              </div>
            </h2>
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
                  :disabled="isSaving"
                  @keydown.stop
                  @keyup.stop
                  @keypress.stop />
                <button
                  @click="toggleShowKey(provider.type)"
                  class="btn btn-square join-item"
                  :disabled="isSaving">
                  <svg
                    v-if="showKey[provider.type]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-5 h-5">
                    <path
                      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-5 h-5">
                    <path
                      d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
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
                @click="testApiKey(provider)"
                class="btn btn-outline btn-sm"
                :disabled="
                  !provider.apiKey ||
                  !String(provider.apiKey).trim() ||
                  isSaving ||
                  isLoading
                ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-4 h-4">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                测试连接
              </button>
              <button
                @click="saveApiKey(provider)"
                class="btn btn-primary btn-sm"
                :disabled="
                  !provider.apiKey ||
                  !String(provider.apiKey).trim() ||
                  isSaving
                ">
                <span
                  v-if="isSaving"
                  class="loading loading-spinner loading-sm"></span>
                <span v-else>保存</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 帮助信息 -->
      <div class="alert alert-info mt-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-6 h-6">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="font-bold">💡 提示</h3>
          <div class="text-sm mt-1">
            <p>• API 密钥将安全地保存在本地</p>
            <p>• 点击"测试连接"可以验证密钥是否有效</p>
            <p>• 至少配置一个供应商的密钥才能使用 AI 聊天功能</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
