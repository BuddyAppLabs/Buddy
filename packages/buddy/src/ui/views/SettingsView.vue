<!--
  设置主页面 - VSCode风格
  左侧分类导航，右侧具体设置项
-->
<script setup lang="ts">
  import { ref } from 'vue';
  import {
    SettingsSidebar,
    GeneralSettings,
    AISettings,
    AboutSettings,
  } from '@/ui/components/settings';

  interface SettingCategory {
    id: string;
    title: string;
  }

  // 左侧分类
  const categories: SettingCategory[] = [
    { id: 'general', title: '通用' },
    { id: 'ai', title: 'AI' },
    { id: 'about', title: '关于' },
  ];

  // 当前选中的分类
  const activeCategory = ref('general');

  // 切换分类
  const selectCategory = (categoryId: string) => {
    activeCategory.value = categoryId;
  };
</script>

<template>
  <div class="absolute inset-0 flex overflow-hidden bg-base-100">
    <!-- 左侧分类导航 -->
    <SettingsSidebar
      :active-category="activeCategory"
      :categories="categories"
      @select="selectCategory" />

    <!-- 右侧设置内容 - 独立滚动 -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden">
      <div class="p-6 max-w-3xl">
        <!-- 分类标题 -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold">
            {{ categories.find((c) => c.id === activeCategory)?.title }}
          </h1>
        </div>

        <!-- 根据分类显示不同的设置组件 -->
        <GeneralSettings v-if="activeCategory === 'general'" />
        <AISettings v-else-if="activeCategory === 'ai'" />
        <AboutSettings v-else-if="activeCategory === 'about'" />
      </div>
    </div>
  </div>
</template>
