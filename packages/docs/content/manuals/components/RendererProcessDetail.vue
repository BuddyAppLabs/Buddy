<template>
  <div class="renderer-process-detail">
    <div class="flex items-center gap-3 mb-4">
      <div class="text-3xl">🎨</div>
      <div>
        <h4 class="text-xl font-bold text-gray-800">渲染进程 (Renderer Process)</h4>
        <p class="text-sm text-gray-500">Vue 3 + Tailwind CSS - 用户界面</p>
      </div>
    </div>

    <!-- 技术栈 -->
    <div class="mb-6">
      <h5 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span class="text-lg">🛠️</span>
        技术栈
      </h5>
      <div class="flex flex-wrap gap-2">
        <span 
          v-for="tech in techStack" 
          :key="tech.name"
          class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200"
        >
          <span>{{ tech.icon }}</span>
          <span>{{ tech.name }}</span>
        </span>
      </div>
    </div>

    <!-- 目录结构 -->
    <div class="mb-6">
      <h5 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span class="text-lg">📁</span>
        目录结构
      </h5>
      <div class="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
        <div v-for="(item, index) in fileStructure" :key="index" class="flex items-start gap-2 py-1">
          <span :class="item.color">{{ item.icon }}</span>
          <span :class="item.highlight ? 'text-yellow-300 font-semibold' : ''">{{ item.path }}</span>
          <span v-if="item.desc" class="text-gray-500 text-xs ml-2">// {{ item.desc }}</span>
        </div>
      </div>
    </div>

    <!-- 核心模块 -->
    <div>
      <h5 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span class="text-lg">📦</span>
        核心模块
      </h5>
      <div class="space-y-2">
        <div 
          v-for="module in coreModules" 
          :key="module.name"
          class="p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="font-semibold text-gray-800">{{ module.name }}</span>
            <code class="text-xs bg-white px-2 py-1 rounded text-green-700 border border-green-200">
              {{ module.file }}
            </code>
          </div>
          <p class="text-sm text-gray-600">{{ module.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const techStack = [
  { name: 'Vue 3', icon: '💚' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Tailwind CSS', icon: '🎨' },
  { name: 'DaisyUI', icon: '🌼' },
  { name: 'Pinia', icon: '🍍' },
  { name: 'Vue Router', icon: '🛣️' }
];

const fileStructure = [
  { icon: '📂', path: 'src/ui/', color: 'text-blue-400' },
  { icon: '├─', path: 'main.ts', color: 'text-gray-400', highlight: true, desc: '应用入口' },
  { icon: '├─', path: 'router.ts', color: 'text-gray-400', highlight: true, desc: '路由配置' },
  { icon: '├─', path: 'app.css', color: 'text-gray-400', desc: '全局样式' },
  { icon: '├─', path: '📂 layout/', color: 'text-blue-400' },
  { icon: '│  ├─', path: 'App.vue', color: 'text-gray-400', desc: '根布局' },
  { icon: '│  ├─', path: 'StatusBar.vue', color: 'text-gray-400', desc: '状态栏' },
  { icon: '│  └─', path: 'BottomNavbar.vue', color: 'text-gray-400', desc: '底部导航' },
  { icon: '├─', path: '📂 views/', color: 'text-blue-400', desc: '页面视图' },
  { icon: '├─', path: '📂 components/', color: 'text-blue-400', desc: '组件' },
  { icon: '├─', path: '📂 stores/', color: 'text-blue-400', desc: 'Pinia 状态' },
  { icon: '├─', path: '📂 ipc/', color: 'text-blue-400', desc: 'IPC 通信' },
  { icon: '└─', path: '📂 composables/', color: 'text-blue-400', desc: '组合式函数' }
];

const coreModules = [
  {
    name: '路由系统',
    file: 'router.ts',
    desc: 'Vue Router 配置，管理页面导航和路由守卫'
  },
  {
    name: 'IPC 通信',
    file: 'ipc/*.ts',
    desc: '封装与主进程的通信接口，如 marketIpc、viewIpc、fileIpc'
  },
  {
    name: '状态管理',
    file: 'stores/*.ts',
    desc: 'Pinia stores，管理全局状态（插件、配置、UI 状态等）'
  },
  {
    name: '布局组件',
    file: 'layout/*.vue',
    desc: '应用布局、状态栏、导航栏等核心 UI 组件'
  }
];
</script>
