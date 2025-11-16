<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import BottomNavbar from '@/ui/layout/BottomNavbar.vue';
  import WindowActiveStatus from '@/ui/components/status/WindowActiveStatus.vue';
  import VersionCheckButton from '@/ui/components/status/VersionCheckButton.vue';

  const router = useRouter();

  const handleOpenAIChat = () => {
    router.push('/ai-chat');
  };

  const handleOpenSettings = () => {
    router.push('/settings');
  };
</script>

<template>
  <div
    class="w-full no-drag-region bg-base-200 shadow-2xl border-t border-accent/30 py-1 px-4 flex justify-between items-center">
    <div class="text-sm text-base-content/70 flex items-center gap-2">
      <WindowActiveStatus />
      <VersionCheckButton />
    </div>
    <div class="flex items-center gap-2">
      <!-- 设置按钮 -->
      <button
        @click="handleOpenSettings"
        class="btn btn-ghost btn-sm gap-1 text-base-content/70 hover:text-base-content transition-colors"
        title="设置"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
          />
        </svg>
      </button>

      <!-- AI 聊天按钮 -->
      <button
        @click="handleOpenAIChat"
        class="btn btn-ghost btn-sm gap-1 text-base-content/70 hover:text-base-content transition-colors"
        title="AI 聊天"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            d="M12 2L9.19 8.63L2 11.38L9.19 14.13L12 21L14.81 14.13L22 11.38L14.81 8.63L12 2Z"
          />
        </svg>
      </button>
      
      <!-- 右侧导航部分 -->
      <BottomNavbar />
    </div>
  </div>
</template>
