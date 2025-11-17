<!--
  通用设置组件
-->
<script setup lang="ts">
  import { ref } from 'vue';
  import { configIpc } from '@/ui/ipc/config-ipc';
  import { FolderOpenIcon } from '@/ui/icons';

  interface SettingItem {
    id: string;
    title: string;
    description: string;
    type: 'toggle' | 'input' | 'select' | 'action';
    value?: any;
    options?: Array<{ label: string; value: any }>;
    action?: () => void;
  }

  // 打开配置文件夹
  const openConfigFolder = async () => {
    try {
      const response = await configIpc.openConfigFolder();
      if (!response.success) {
        console.error('打开配置文件夹失败:', response.error);
      }
    } catch (error) {
      console.error('打开配置文件夹失败:', error);
    }
  };

  const settings = ref<SettingItem[]>([
    {
      id: 'open-config',
      title: '打开配置文件夹',
      description: '在文件管理器中打开配置文件夹',
      type: 'action',
      action: openConfigFolder,
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

      <!-- Action 类型 -->
      <div
        v-else-if="item.type === 'action'"
        @click="item.action?.()"
        class="flex items-center justify-between cursor-pointer hover:bg-base-200 -mx-3 px-3 py-2 rounded-lg transition-colors">
        <div class="flex-1">
          <h3 class="font-medium">{{ item.title }}</h3>
          <p class="text-sm text-base-content/70 mt-1">
            {{ item.description }}
          </p>
        </div>
        <FolderOpenIcon class="w-5 h-5 text-base-content/40" />
      </div>
    </div>
  </div>
</template>
