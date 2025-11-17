<!--
  设置侧边栏组件
  显示设置分类导航
-->
<script setup lang="ts">
  import { SettingsIcon, AIIcon, KeyboardIcon, InfoIcon } from '@/ui/icons';

  interface SettingCategory {
    id: string;
    title: string;
  }

  interface Props {
    activeCategory: string;
    categories: SettingCategory[];
  }

  interface Emits {
    (e: 'select', categoryId: string): void;
  }

  defineProps<Props>();
  const emit = defineEmits<Emits>();

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
</script>

<template>
  <div
    class="w-48 border-r border-base-300 bg-base-200/50 flex-shrink-0 overflow-hidden">
    <div class="p-4">
      <h2 class="text-lg font-semibold mb-4">设置</h2>
      <nav class="space-y-1">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="emit('select', category.id)"
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
</template>
