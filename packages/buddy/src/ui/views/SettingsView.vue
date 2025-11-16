<!--
  设置主页面
  包含所有应用设置的入口
-->
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

const settingItems: SettingItem[] = [
  {
    id: 'ai',
    title: 'AI 设置',
    description: '配置 AI 供应商的 API 密钥和模型',
    icon: 'M12 2L9.19 8.63L2 11.38L9.19 14.13L12 21L14.81 14.13L22 11.38L14.81 8.63L12 2Z',
    route: '/settings/ai',
  },
  {
    id: 'general',
    title: '通用设置',
    description: '应用的基本配置和偏好设置',
    icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    route: '/settings/general',
  },
  {
    id: 'shortcuts',
    title: '快捷键',
    description: '自定义键盘快捷键',
    icon: 'M20 7h-5V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 4h6v3H9V4zm11 16H4V9h16v11zm-9-1h4v-2h-4v2zm0-4h4v-2h-4v2z',
    route: '/settings/shortcuts',
  },
  {
    id: 'about',
    title: '关于',
    description: '应用版本信息和更新',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    route: '/settings/about',
  },
];

const goToSetting = (item: SettingItem) => {
  router.push(item.route);
};

const isActive = (itemRoute: string) => {
  return route.path === itemRoute;
};
</script>

<template>
  <div class="h-full overflow-y-auto p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 标题 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-7 h-7"
          >
            <path
              d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
            />
          </svg>
          设置
        </h1>
        <p class="text-base-content/70 mt-2">
          管理应用的各项配置和偏好设置
        </p>
      </div>

      <!-- 设置项列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in settingItems"
          :key="item.id"
          @click="goToSetting(item)"
          class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
          :class="{ 'ring-2 ring-primary': isActive(item.route) }"
        >
          <div class="card-body">
            <div class="flex items-start gap-4">
              <!-- 图标 -->
              <div class="shrink-0">
                <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-6 h-6 text-primary"
                  >
                    <path :d="item.icon" />
                  </svg>
                </div>
              </div>
              
              <!-- 内容 -->
              <div class="flex-1">
                <h3 class="card-title text-lg">{{ item.title }}</h3>
                <p class="text-sm text-base-content/70 mt-1">
                  {{ item.description }}
                </p>
              </div>

              <!-- 箭头 -->
              <div class="shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-5 h-5 text-base-content/40"
                >
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="alert alert-info mt-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="font-bold">💡 提示</h3>
          <div class="text-sm">
            所有设置都会自动保存到本地，重启应用后依然有效
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
