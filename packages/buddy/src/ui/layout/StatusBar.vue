<script setup lang="ts">
  import BottomNavbar from '@/ui/layout/BottomNavbar.vue';
</script>

<template>
  <div
    class="w-full no-drag-region bg-base-200 shadow-2xl border-t border-accent/30 py-1 px-4 flex justify-between items-center">
    <div class="text-sm text-base-content/70 flex items-center gap-2">
      <!-- <WindowActiveStatus /> -->
      <!-- <VersionCheckButton /> -->
    </div>
    <div class="flex items-center gap-2">
      <!-- 右侧导航部分 -->
      <BottomNavbar />
    </div>
  </div>
</template>
