<template>
  <div class="architecture-overview space-y-6">
    <!-- 整体架构图 -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
      <h3 class="text-lg font-semibold mb-4 text-gray-800">Buddy 架构全景</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 主进程 -->
        <div 
          @click="activeLayer = 'main'"
          :class="[
            'cursor-pointer transition-all duration-300 rounded-lg p-4 border-2',
            activeLayer === 'main' 
              ? 'bg-blue-500 text-white border-blue-600 shadow-lg scale-105' 
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md'
          ]"
        >
          <div class="text-2xl mb-2">⚙️</div>
          <div class="font-semibold mb-1">主进程 (Main)</div>
          <div :class="activeLayer === 'main' ? 'text-blue-100' : 'text-gray-500'" class="text-sm">
            Electron 主进程<br/>插件管理、系统服务
          </div>
        </div>

        <!-- 渲染进程 -->
        <div 
          @click="activeLayer = 'renderer'"
          :class="[
            'cursor-pointer transition-all duration-300 rounded-lg p-4 border-2',
            activeLayer === 'renderer' 
              ? 'bg-green-500 text-white border-green-600 shadow-lg scale-105' 
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:shadow-md'
          ]"
        >
          <div class="text-2xl mb-2">🎨</div>
          <div class="font-semibold mb-1">渲染进程 (Renderer)</div>
          <div :class="activeLayer === 'renderer' ? 'text-green-100' : 'text-gray-500'" class="text-sm">
            Vue 3 界面<br/>用户交互层
          </div>
        </div>

        <!-- 插件系统 -->
        <div 
          @click="activeLayer = 'plugin'"
          :class="[
            'cursor-pointer transition-all duration-300 rounded-lg p-4 border-2',
            activeLayer === 'plugin' 
              ? 'bg-purple-500 text-white border-purple-600 shadow-lg scale-105' 
              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:shadow-md'
          ]"
        >
          <div class="text-2xl mb-2">🧩</div>
          <div class="font-semibold mb-1">插件系统 (Plugins)</div>
          <div :class="activeLayer === 'plugin' ? 'text-purple-100' : 'text-gray-500'" class="text-sm">
            动态扩展<br/>功能模块
          </div>
        </div>
      </div>

      <!-- IPC 通信层 -->
      <div class="mt-6 text-center">
        <div class="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full border border-yellow-300">
          <span class="text-lg">⚡</span>
          <span class="font-semibold">IPC 通信</span>
          <span class="text-sm">(进程间通信)</span>
        </div>
      </div>
    </div>

    <!-- 详细信息面板 -->
    <transition name="fade" mode="out-in">
      <div :key="activeLayer" class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <component :is="activeComponent" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import MainProcessDetail from './MainProcessDetail.vue';
import RendererProcessDetail from './RendererProcessDetail.vue';
import PluginSystemDetail from './PluginSystemDetail.vue';

const activeLayer = ref('main');

const activeComponent = computed(() => {
  const components = {
    main: MainProcessDetail,
    renderer: RendererProcessDetail,
    plugin: PluginSystemDetail
  };
  return components[activeLayer.value];
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
