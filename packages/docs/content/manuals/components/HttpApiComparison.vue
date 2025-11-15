<template>
  <div class="http-api-comparison">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">通信方案对比</h3>
    
    <!-- 方案切换 -->
    <div class="flex gap-4 mb-6">
      <button
        @click="activeScheme = 'current'"
        :class="[
          'flex-1 p-4 rounded-lg border-2 transition-all',
          activeScheme === 'current'
            ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
        ]"
      >
        <div class="text-2xl mb-2">⚡</div>
        <div class="font-semibold">当前方案</div>
        <div class="text-sm opacity-80">进程内直接调用</div>
      </button>
      
      <button
        @click="activeScheme = 'http'"
        :class="[
          'flex-1 p-4 rounded-lg border-2 transition-all',
          activeScheme === 'http'
            ? 'bg-green-500 text-white border-green-600 shadow-lg'
            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
        ]"
      >
        <div class="text-2xl mb-2">🌐</div>
        <div class="font-semibold">HTTP API 方案</div>
        <div class="text-sm opacity-80">HTTP 服务器通信</div>
      </button>
    </div>

    <!-- 架构图 -->
    <transition name="fade" mode="out-in">
      <div :key="activeScheme" class="mb-6">
        <div v-if="activeScheme === 'current'" class="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h4 class="font-semibold text-gray-800 mb-4">当前架构：进程内直接调用</h4>
          <div class="flex items-center justify-center gap-4">
            <div class="text-center">
              <div class="bg-purple-500 text-white px-6 py-4 rounded-lg font-semibold shadow-md">
                🧩 插件
              </div>
              <div class="text-xs text-gray-600 mt-2">运行在主进程</div>
            </div>
            
            <div class="flex flex-col items-center">
              <code class="text-sm bg-white px-3 py-1 rounded border mb-1">import()</code>
              <div class="text-2xl">→</div>
              <code class="text-sm bg-white px-3 py-1 rounded border mt-1">context</code>
            </div>
            
            <div class="text-center">
              <div class="bg-blue-500 text-white px-6 py-4 rounded-lg font-semibold shadow-md">
                ⚙️ 内核
              </div>
              <div class="text-xs text-gray-600 mt-2">主进程</div>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-600 text-center">
            ⚡ 纳秒级性能 • 类型安全 • 简单直接
          </div>
        </div>

        <div v-else class="bg-green-50 rounded-lg p-6 border border-green-200">
          <h4 class="font-semibold text-gray-800 mb-4">HTTP API 方案</h4>
          <div class="flex items-center justify-center gap-4">
            <div class="text-center">
              <div class="bg-purple-500 text-white px-6 py-4 rounded-lg font-semibold shadow-md">
                🧩 插件
              </div>
              <div class="text-xs text-gray-600 mt-2">独立进程</div>
            </div>
            
            <div class="flex flex-col items-center">
              <code class="text-sm bg-white px-3 py-1 rounded border mb-1">HTTP Request</code>
              <div class="text-2xl">→</div>
              <code class="text-sm bg-white px-3 py-1 rounded border mt-1">Express Server</code>
            </div>
            
            <div class="text-center">
              <div class="bg-green-500 text-white px-6 py-4 rounded-lg font-semibold shadow-md">
                🌐 HTTP API
              </div>
              <div class="text-xs text-gray-600 mt-2">Express 服务器</div>
            </div>
            
            <div class="text-2xl">→</div>
            
            <div class="text-center">
              <div class="bg-blue-500 text-white px-6 py-4 rounded-lg font-semibold shadow-md">
                ⚙️ 内核
              </div>
              <div class="text-xs text-gray-600 mt-2">主进程</div>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-600 text-center">
            🌐 跨语言支持 • 进程隔离 • 标准化接口
          </div>
        </div>
      </div>
    </transition>

    <!-- 对比表格 -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">对比维度</th>
            <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-700">
              ⚡ 当前方案
            </th>
            <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-green-700">
              🌐 HTTP API
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in comparisonData" :key="item.aspect">
            <td class="border border-gray-300 px-4 py-3 font-medium text-gray-700">
              {{ item.aspect }}
            </td>
            <td class="border border-gray-300 px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <span :class="getRatingClass(item.current)">{{ getRatingIcon(item.current) }}</span>
                <span class="text-sm text-gray-600">{{ item.currentDesc }}</span>
              </div>
            </td>
            <td class="border border-gray-300 px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <span :class="getRatingClass(item.http)">{{ getRatingIcon(item.http) }}</span>
                <span class="text-sm text-gray-600">{{ item.httpDesc }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 推荐 -->
    <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div class="flex items-start gap-3">
        <span class="text-2xl">💡</span>
        <div>
          <div class="font-semibold text-gray-800 mb-2">推荐方案</div>
          <p class="text-sm text-gray-700 mb-3">
            <strong>保持当前的进程内调用方案</strong>，因为：
          </p>
          <ul class="text-sm text-gray-700 space-y-1 ml-4">
            <li>• 性能优异（纳秒级 vs 毫秒级）</li>
            <li>• 开发体验好（TypeScript 类型安全）</li>
            <li>• 架构简单（无需管理 HTTP 服务器）</li>
            <li>• 适合桌面应用场景（不需要远程插件）</li>
          </ul>
          <p class="text-sm text-gray-700 mt-3">
            如果未来需要支持远程插件或跨语言插件，可以考虑<strong>混合方案</strong>：
            本地插件使用进程内调用，远程插件使用 HTTP API。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeScheme = ref('current');

const comparisonData = [
  {
    aspect: '性能',
    current: 5,
    currentDesc: '纳秒级',
    http: 2,
    httpDesc: '毫秒级'
  },
  {
    aspect: '类型安全',
    current: 5,
    currentDesc: 'TypeScript 完整支持',
    http: 2,
    httpDesc: '需要额外验证'
  },
  {
    aspect: '开发体验',
    current: 5,
    currentDesc: '简单直接',
    http: 3,
    httpDesc: '需要处理 HTTP 客户端'
  },
  {
    aspect: '进程隔离',
    current: 2,
    currentDesc: '同进程运行',
    http: 5,
    httpDesc: '完全隔离'
  },
  {
    aspect: '跨语言支持',
    current: 1,
    currentDesc: '仅 JavaScript/TypeScript',
    http: 5,
    httpDesc: '任意语言'
  },
  {
    aspect: '调试友好',
    current: 4,
    currentDesc: 'Node.js 调试器',
    http: 5,
    httpDesc: 'Postman/curl 等工具'
  },
  {
    aspect: '部署复杂度',
    current: 5,
    currentDesc: '无需额外配置',
    http: 2,
    httpDesc: '需要管理端口和服务器'
  },
  {
    aspect: '安全性',
    current: 3,
    currentDesc: '需要代码审查',
    http: 4,
    httpDesc: '网络层权限控制'
  }
];

function getRatingIcon(rating) {
  if (rating >= 4) return '⭐⭐⭐';
  if (rating >= 3) return '⭐⭐';
  return '⭐';
}

function getRatingClass(rating) {
  if (rating >= 4) return 'text-green-600';
  if (rating >= 3) return 'text-yellow-600';
  return 'text-red-600';
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

table {
  font-size: 0.875rem;
}
</style>
