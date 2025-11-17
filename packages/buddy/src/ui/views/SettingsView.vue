<!--
  设置主页面 - VSCode风格
  左侧分类导航，右侧具体设置项
-->
<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { aiIpc } from '@/ui/ipc/ai-ipc';
  import {
    SettingsIcon,
    AIIcon,
    KeyboardIcon,
    InfoIcon,
    EyeIcon,
    EyeOffIcon,
    CheckIcon,
  } from '@/ui/icons';

  interface SettingCategory {
    id: string;
    title: string;
  }

  interface SettingItem {
    id: string;
    category: string;
    title: string;
    description: string;
    type: 'toggle' | 'input' | 'select' | 'link';
    value?: any;
    options?: Array<{ label: string; value: any }>;
    route?: string;
  }

  interface AIProvider {
    type: string;
    name: string;
    apiKey: string;
    url: string;
    description: string;
    models: Array<{ id: string; name: string }>;
  }

  // 左侧分类
  const categories: SettingCategory[] = [
    {
      id: 'general',
      title: '通用',
    },
    {
      id: 'ai',
      title: 'AI',
    },
    {
      id: 'shortcuts',
      title: '快捷键',
    },
    {
      id: 'about',
      title: '关于',
    },
  ];

  // 右侧设置项
  const settingItems: SettingItem[] = [
    // 通用设置
    {
      id: 'theme',
      category: 'general',
      title: '主题',
      description: '选择应用主题',
      type: 'select',
      value: 'auto',
      options: [
        { label: '自动', value: 'auto' },
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' },
      ],
    },
    {
      id: 'language',
      category: 'general',
      title: '语言',
      description: '选择界面语言',
      type: 'select',
      value: 'zh-CN',
      options: [
        { label: '简体中文', value: 'zh-CN' },
        { label: 'English', value: 'en-US' },
      ],
    },
    {
      id: 'auto-update',
      category: 'general',
      title: '自动更新',
      description: '自动检查并下载更新',
      type: 'toggle',
      value: true,
    },
    {
      id: 'startup',
      category: 'general',
      title: '开机启动',
      description: '系统启动时自动运行 Buddy',
      type: 'toggle',
      value: false,
    },

    // AI 设置 - 移除，改为直接在页面中显示

    // 快捷键设置
    {
      id: 'global-hotkey',
      category: 'shortcuts',
      title: '全局快捷键',
      description: '唤起 Buddy 的快捷键',
      type: 'input',
      value: 'Option+Space',
    },

    // 关于
    {
      id: 'version',
      category: 'about',
      title: '版本',
      description: 'Buddy v1.5.47',
      type: 'link',
    },
    {
      id: 'check-update',
      category: 'about',
      title: '检查更新',
      description: '检查是否有新版本可用',
      type: 'link',
    },
  ];

  // 当前选中的分类
  const activeCategory = ref('general');

  // 根据分类过滤设置项
  const filteredSettings = computed(() => {
    return settingItems.filter(
      (item) => item.category === activeCategory.value
    );
  });

  // 切换分类
  const selectCategory = (categoryId: string) => {
    activeCategory.value = categoryId;
  };

  // 获取分类图标组件
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, any> = {
      general: SettingsIcon,
      ai: AIIcon,
      shortcuts: KeyboardIcon,
      about: InfoIcon,
    };
    return iconMap[categoryId] || SettingsIcon;
  };

  // 处理设置项点击
  const handleItemClick = (item: SettingItem) => {
    if (item.type === 'link' && item.route) {
      // 不再跳转，已移除
    }
  };

  // ========== AI 配置相关 ==========
  const aiProviders = ref<AIProvider[]>([]);
  const isLoadingAI = ref(false);
  const isSavingAI = ref(false);
  const successMessage = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);
  const showKey = ref<Record<string, boolean>>({});

  // 供应商信息
  const providerInfo: Record<string, { url: string; description: string }> = {
    openai: {
      url: 'https://platform.openai.com/api-keys',
      description: 'OpenAI 提供 GPT-4、GPT-3.5 等先进的语言模型',
    },
    deepseek: {
      url: 'https://platform.deepseek.com/api_keys',
      description: 'DeepSeek 提供高性价比的中文优化模型',
    },
    anthropic: {
      url: 'https://console.anthropic.com/settings/keys',
      description: 'Anthropic 提供 Claude 系列模型，擅长长文本处理',
    },
  };

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
            url: providerInfo[p.type]?.url || '',
            description: providerInfo[p.type]?.description || '',
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
          provider.apiKey = String(response.data);
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

  // 测试API密钥
  const testApiKey = async (provider: AIProvider) => {
    if (!provider.apiKey || !String(provider.apiKey).trim()) {
      errorMessage.value = '请先输入 API 密钥';
      return;
    }

    isLoadingAI.value = true;
    errorMessage.value = null;

    try {
      await saveApiKey(provider);

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
      isLoadingAI.value = false;
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

  // 监听分类切换，加载AI配置
  watch(activeCategory, (newCategory) => {
    if (newCategory === 'ai' && aiProviders.value.length === 0) {
      loadAIProviders();
    }
  });

  onMounted(() => {
    // 如果默认显示AI分类，则加载
    if (activeCategory.value === 'ai') {
      loadAIProviders();
    }
  });
</script>

<template>
  <div class="absolute inset-0 flex overflow-hidden bg-base-100">
    <!-- 左侧分类导航 - 固定不滚动 -->
    <div
      class="w-48 border-r border-base-300 bg-base-200/50 flex-shrink-0 overflow-hidden">
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">设置</h2>
        <nav class="space-y-1">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectCategory(category.id)"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
            :class="
              activeCategory === category.id
                ? 'bg-primary text-primary-content'
                : 'hover:bg-base-300 text-base-content'
            ">
            <component
              :is="getCategoryIcon(category.id)"
              class="w-5 h-5 shrink-0" />
            <span class="text-sm">{{ category.title }}</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- 右侧设置内容 - 独立滚动 -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden">
      <div class="p-6 max-w-3xl">
        <!-- 分类标题 -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold">
            {{ categories.find((c) => c.id === activeCategory)?.title }}
          </h1>
        </div>

        <!-- AI 分类的特殊显示 -->
        <div v-if="activeCategory === 'ai'">
          <!-- 消息提示 -->
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
                    @click="testApiKey(provider)"
                    class="btn btn-outline btn-sm"
                    :disabled="
                      !provider.apiKey ||
                      !String(provider.apiKey).trim() ||
                      isSavingAI ||
                      isLoadingAI
                    ">
                    <CheckIcon class="w-4 h-4" />
                    测试连接
                  </button>
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

            <!-- 帮助信息 -->
            <div class="alert alert-info">
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

        <!-- 其他分类的设置项列表 -->
        <div v-else class="space-y-6">
          <div
            v-for="item in filteredSettings"
            :key="item.id"
            class="pb-6 border-b border-base-300 last:border-0">
            <!-- Toggle 类型 -->
            <div
              v-if="item.type === 'toggle'"
              class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="font-medium">{{ item.title }}</h3>
                <p class="text-sm text-base-content/70 mt-1">
                  {{ item.description }}
                </p>
              </div>
              <input
                type="checkbox"
                v-model="item.value"
                class="toggle toggle-primary" />
            </div>

            <!-- Input 类型 -->
            <div v-else-if="item.type === 'input'">
              <h3 class="font-medium mb-2">{{ item.title }}</h3>
              <p class="text-sm text-base-content/70 mb-3">
                {{ item.description }}
              </p>
              <input
                type="text"
                v-model="item.value"
                class="input input-bordered w-full max-w-xs" />
            </div>

            <!-- Select 类型 -->
            <div v-else-if="item.type === 'select'">
              <h3 class="font-medium mb-2">{{ item.title }}</h3>
              <p class="text-sm text-base-content/70 mb-3">
                {{ item.description }}
              </p>
              <select
                v-model="item.value"
                class="select select-bordered w-full max-w-xs">
                <option
                  v-for="option in item.options"
                  :key="option.value"
                  :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Link 类型 -->
            <div
              v-else-if="item.type === 'link'"
              class="flex items-center justify-between hover:bg-base-200 -mx-3 px-3 py-2 rounded-lg transition-colors">
              <div class="flex-1">
                <h3 class="font-medium">{{ item.title }}</h3>
                <p class="text-sm text-base-content/70 mt-1">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
