<script setup lang="ts">
  import ActionList from '@/ui/components/home/ActionList.vue';
  import PluginPageGrid from '@/ui/components/home/PluginPageGrid.vue';
  import SearchBar from '@/ui/layout/SearchBar.vue';
</script>

<template>
  <div class="w-full px-1">
    <!-- 搜索区域 -->
    <div class="mb-4">
      <SearchBar />
    </div>

    <!-- 插件动作列表 -->
    <ActionList />

    <!-- 插件视图网格 -->
    <PluginPageGrid />
  </div>
</template>
