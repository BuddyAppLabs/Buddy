<template>
  <div class="main-process-detail">
    <div class="flex items-center gap-3 mb-4">
      <div class="text-3xl">⚙️</div>
      <div>
        <h4 class="text-xl font-bold text-gray-800">主进程 (Main Process)</h4>
        <p class="text-sm text-gray-500">Electron 主进程 - 应用核心</p>
      </div>
    </div>

    <!-- 启动流程 -->
    <div class="mb-6">
      <h5 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span class="text-lg">🚀</span>
        启动流程
      </h5>
      <div class="space-y-2">
        <div 
          v-for="(step, index) in bootSteps" 
          :key="index"
          class="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <div class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {{ index + 1 }}
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-800">{{ step.title }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ step.desc }}</div>
            <code class="text-xs text-blue-600 mt-1 block">{{ step.file }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务提供者 -->
    <div>
      <h5 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span class="text-lg">🔌</span>
        服务提供者 (Service Providers)
      </h5>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div 
          v-for="provider in providers" 
          :key="provider.name"
          class="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{{ provider.icon }}</span>
            <span class="font-semibold text-gray-800">{{ provider.name }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ provider.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const bootSteps = [
  {
    title: '等待 Electron 就绪',
    desc: 'app.whenReady() - 等待 Electron 应用初始化完成',
    file: 'bootstrap/app.ts'
  },
  {
    title: '创建应用实例',
    desc: '使用 cosy-framework 创建应用，注册所有服务提供者',
    file: 'createElectronApp(config)'
  },
  {
    title: '初始化插件系统',
    desc: '加载用户插件、开发插件，扫描插件目录',
    file: 'PluginFacade.initialize()'
  },
  {
    title: '注册路由与 IPC',
    desc: '注册所有 IPC 处理器，建立主进程与渲染进程的通信',
    file: 'registerRoutes()'
  },
  {
    title: '启动应用管理器',
    desc: '创建托盘图标、主窗口，监听系统事件',
    file: 'appManager.start()'
  }
];

const providers = [
  { name: 'AI', icon: '🤖', desc: 'AI 模型管理，支持 DeepSeek、OpenAI 等' },
  { name: 'Plugin', icon: '🧩', desc: '插件加载、管理、执行' },
  { name: 'Window', icon: '🪟', desc: '窗口管理、视图控制' },
  { name: 'State', icon: '📊', desc: '应用状态管理' },
  { name: 'Keyboard', icon: '⌨️', desc: '全局快捷键监听' },
  { name: 'Setting', icon: '⚙️', desc: '配置管理' },
  { name: 'Update', icon: '🔄', desc: '自动更新检查' },
  { name: 'MCP', icon: '🔗', desc: 'Model Context Protocol' }
];
</script>
