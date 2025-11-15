<template>
  <div class="plugin-system-detail">
    <div class="flex items-center gap-3 mb-4">
      <div class="text-3xl">🧩</div>
      <div>
        <h4 class="text-xl font-bold text-gray-800">插件系统 (Plugin System)</h4>
        <p class="text-sm text-gray-500">动态扩展 - 功能模块化</p>
      </div>
    </div>

    <!-- 通信机制 -->
    <div class="mb-6">
      <h5 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span class="text-lg">🔄</span>
        插件与内核通信机制
      </h5>
      
      <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
        <div class="flex items-center justify-between mb-4">
          <div class="flex-1 text-center">
            <div class="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
              🧩 插件实例
            </div>
            <div class="text-xs text-gray-600 mt-2">运行在主进程</div>
          </div>
          
          <div class="flex flex-col items-center gap-2 px-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl">→</span>
              <code class="text-xs bg-white px-2 py-1 rounded border">context</code>
              <span class="text-2xl">→</span>
            </div>
            <div class="text-xs text-gray-600 whitespace-nowrap">直接函数调用</div>
          </div>
          
          <div class="flex-1 text-center">
            <div class="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
              ⚙️ 内核
            </div>
            <div class="text-xs text-gray-600 mt-2">PluginManager</div>
          </div>
        </div>

        <div class="bg-white rounded p-3 text-sm">
          <div class="font-semibold text-gray-700 mb-2">✅ 当前方案：进程内直接调用</div>
          <ul class="space-y-1 text-gray-600">
            <li>• 插件通过 <code class="text-purple-600 bg-purple-50 px-1 rounded">import</code> 动态加载到主进程</li>
            <li>• 内核通过 <code class="text-purple-600 bg-purple-50 px-1 rounded">SuperContext</code> 注入能力</li>
            <li>• 性能极高（纳秒级），类型安全</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 插件生命周期 -->
    <div class="mb-6">
      <h5 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span class="text-lg">♻️</span>
        插件生命周期
      </h5>
      <div class="relative">
        <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-200"></div>
        <div class="space-y-3 relative">
          <div 
            v-for="(phase, index) in lifecycle" 
            :key="index"
            class="flex items-start gap-3 pl-10"
          >
            <div class="absolute left-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
              {{ index + 1 }}
            </div>
            <div class="flex-1 bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div class="font-semibold text-gray-800 mb-1">{{ phase.title }}</div>
              <div class="text-sm text-gray-600">{{ phase.desc }}</div>
              <code class="text-xs text-purple-600 mt-1 block">{{ phase.method }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SuperContext 能力 -->
    <div>
      <h5 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span class="text-lg">🎁</span>
        SuperContext 提供的能力
      </h5>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div 
          v-for="capability in capabilities" 
          :key="capability.name"
          class="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{{ capability.icon }}</span>
            <span class="font-semibold text-gray-800">{{ capability.name }}</span>
          </div>
          <p class="text-sm text-gray-600 mb-2">{{ capability.desc }}</p>
          <div class="flex flex-wrap gap-1">
            <code 
              v-for="method in capability.methods" 
              :key="method"
              class="text-xs bg-white px-2 py-0.5 rounded text-purple-700 border border-purple-200"
            >
              {{ method }}
            </code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const lifecycle = [
  {
    title: '扫描与发现',
    desc: '扫描插件目录，读取 package.json',
    method: 'DevPluginRepo.getAllPlugins()'
  },
  {
    title: '加载插件',
    desc: '使用 import() 动态加载插件模块',
    method: 'PluginEntity.load()'
  },
  {
    title: '获取动作列表',
    desc: '调用插件的 getActions() 获取可用动作',
    method: 'plugin.getActions(context)'
  },
  {
    title: '执行动作',
    desc: '用户触发时，调用 executeAction() 执行',
    method: 'plugin.executeAction(context)'
  }
];

const capabilities = [
  {
    name: '日志',
    icon: '📝',
    desc: '记录插件运行日志',
    methods: ['info', 'warn', 'error', 'debug']
  },
  {
    name: '文件系统',
    icon: '📁',
    desc: '读写插件目录内的文件（安全限制）',
    methods: ['readFile', 'writeFile', 'exists']
  },
  {
    name: '配置',
    icon: '⚙️',
    desc: '读写插件配置',
    methods: ['get', 'set', 'openConfigFolder']
  },
  {
    name: 'AI',
    icon: '🤖',
    desc: '调用 AI 模型生成文本',
    methods: ['generateText', 'setModelApiKey']
  },
  {
    name: '版本',
    icon: '🔢',
    desc: '获取应用版本信息',
    methods: ['getCurrentVersion', 'checkForUpdates']
  },
  {
    name: '上下文',
    icon: '🎯',
    desc: '获取执行上下文信息',
    methods: ['actionId', 'keyword', 'overlaidApp']
  }
];
</script>
