<!--
  通用设置组件
-->
<script setup lang="ts">
  import { ref } from 'vue';

  interface SettingItem {
    id: string;
    title: string;
    description: string;
    type: 'toggle' | 'input' | 'select';
    value: any;
    options?: Array<{ label: string; value: any }>;
  }

  const settings = ref<SettingItem[]>([
    {
      id: 'theme',
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
      title: '自动更新',
      description: '自动检查并下载更新',
      type: 'toggle',
      value: true,
    },
    {
      id: 'startup',
      title: '开机启动',
      description: '系统启动时自动运行 Buddy',
      type: 'toggle',
      value: false,
    },
  ]);
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="item in settings"
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
    </div>
  </div>
</template>
