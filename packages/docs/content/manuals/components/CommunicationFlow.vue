<template>
  <div class="communication-flow">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">IPC 通信流程演示</h3>
    
    <!-- 场景选择 -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="scenario in scenarios"
          :key="scenario.id"
          @click="activeScenario = scenario.id"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-all',
            activeScenario === scenario.id
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ scenario.icon }} {{ scenario.name }}
        </button>
      </div>
    </div>

    <!-- 流程图 -->
    <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
      <transition name="slide-fade" mode="out-in">
        <div :key="activeScenario" class="space-y-4">
          <div 
            v-for="(step, index) in currentSteps" 
            :key="index"
            :style="{ animationDelay: `${index * 0.1}s` }"
            class="flow-step"
          >
            <!-- 步骤卡片 -->
            <div 
              :class="[
                'p-4 rounded-lg border-2 transition-all',
                step.layer === 'renderer' ? 'bg-green-50 border-green-300' :
                step.layer === 'ipc' ? 'bg-yellow-50 border-yellow-300' :
                step.layer === 'main' ? 'bg-blue-50 border-blue-300' :
                'bg-purple-50 border-purple-300'
              ]"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-sm border-2"
                     :class="[
                       step.layer === 'renderer' ? 'border-green-500 text-green-700' :
                       step.layer === 'ipc' ? 'border-yellow-500 text-yellow-700' :
                       step.layer === 'main' ? 'border-blue-500 text-blue-700' :
                       'border-purple-500 text-purple-700'
                     ]">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">{{ step.icon }}</span>
                    <span class="font-semibold text-gray-800">{{ step.title }}</span>
                    <span 
                      :class="[
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        step.layer === 'renderer' ? 'bg-green-200 text-green-800' :
                        step.layer === 'ipc' ? 'bg-yellow-200 text-yellow-800' :
                        step.layer === 'main' ? 'bg-blue-200 text-blue-800' :
                        'bg-purple-200 text-purple-800'
                      ]"
                    >
                      {{ step.layer }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{{ step.desc }}</p>
                  <code class="text-xs bg-white px-2 py-1 rounded border block overflow-x-auto">
                    {{ step.code }}
                  </code>
                </div>
              </div>
            </div>

            <!-- 箭头 -->
            <div v-if="index < currentSteps.length - 1" class="flex justify-center py-2">
              <div class="text-2xl text-gray-400">↓</div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 说明 -->
    <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div class="flex items-start gap-2">
        <span class="text-lg">💡</span>
        <div class="text-sm text-gray-700">
          <strong>提示：</strong>{{ currentScenario.tip }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const activeScenario = ref('plugin-action');

const scenarios = [
  { id: 'plugin-action', name: '执行插件动作', icon: '🎯' },
  { id: 'get-plugins', name: '获取插件列表', icon: '📋' },
  { id: 'install-plugin', name: '安装插件', icon: '📥' }
];

const flowData = {
  'plugin-action': {
    tip: '用户在 UI 中触发插件动作，经过 IPC 通信，最终由主进程中的插件执行',
    steps: [
      {
        layer: 'renderer',
        icon: '👆',
        title: '用户点击动作',
        desc: '在 Vue 组件中触发动作执行',
        code: 'await actionIpc.executeAction(actionId, keyword)'
      },
      {
        layer: 'ipc',
        icon: '⚡',
        title: 'IPC 调用',
        desc: '通过 Electron IPC 发送请求到主进程',
        code: 'ipc.invoke(IPC_METHODS.EXECUTE_PLUGIN_ACTION, actionId, keyword)'
      },
      {
        layer: 'main',
        icon: '🎯',
        title: '路由处理',
        desc: '主进程路由接收请求',
        code: 'RouteFacade.handle(IPC_METHODS.EXECUTE_PLUGIN_ACTION, async (_, actionId, keyword) => {...})'
      },
      {
        layer: 'main',
        icon: '🔍',
        title: '查找插件',
        desc: 'PluginManager 查找对应的插件实例',
        code: 'const plugin = await PluginFacade.find(pluginId)'
      },
      {
        layer: 'plugin',
        icon: '🧩',
        title: '执行插件',
        desc: '调用插件的 executeAction 方法',
        code: 'await plugin.executeAction(context)'
      },
      {
        layer: 'ipc',
        icon: '📤',
        title: '返回结果',
        desc: '通过 IPC 返回执行结果',
        code: 'return { success: true, message: "执行成功" }'
      },
      {
        layer: 'renderer',
        icon: '✅',
        title: '更新 UI',
        desc: 'Vue 组件接收结果并更新界面',
        code: 'if (response.success) { showSuccess(response.message) }'
      }
    ]
  },
  'get-plugins': {
    tip: '应用启动或用户打开插件市场时，获取所有可用插件列表',
    steps: [
      {
        layer: 'renderer',
        icon: '🔄',
        title: '请求插件列表',
        desc: 'Vue 组件请求获取插件',
        code: 'const plugins = await marketIpc.getUserPlugins()'
      },
      {
        layer: 'ipc',
        icon: '⚡',
        title: 'IPC 通信',
        desc: '发送 GET_USER_PLUGINS 请求',
        code: 'ipc.invoke(IPC_METHODS.GET_USER_PLUGINS)'
      },
      {
        layer: 'main',
        icon: '📦',
        title: 'PluginManager',
        desc: '从插件仓库获取所有插件',
        code: 'const plugins = await PluginFacade.all()'
      },
      {
        layer: 'main',
        icon: '🔄',
        title: '转换数据',
        desc: '将插件实体转换为可序列化对象',
        code: 'plugins.map(p => p.getSendablePlugin())'
      },
      {
        layer: 'ipc',
        icon: '📤',
        title: '返回数据',
        desc: '通过 IPC 返回插件列表',
        code: 'return { success: true, data: sendablePlugins }'
      },
      {
        layer: 'renderer',
        icon: '🎨',
        title: '渲染列表',
        desc: 'Vue 组件渲染插件卡片',
        code: '<PluginCard v-for="plugin in plugins" :key="plugin.id" :plugin="plugin" />'
      }
    ]
  },
  'install-plugin': {
    tip: '用户从插件市场安装新插件，涉及下载、解压、加载等步骤',
    steps: [
      {
        layer: 'renderer',
        icon: '📥',
        title: '点击安装',
        desc: '用户点击插件的安装按钮',
        code: 'await marketIpc.downloadPlugin(pluginId)'
      },
      {
        layer: 'ipc',
        icon: '⚡',
        title: 'IPC 请求',
        desc: '发送下载插件请求',
        code: 'ipc.invoke(IPC_METHODS.DOWNLOAD_PLUGIN, pluginId)'
      },
      {
        layer: 'main',
        icon: '🌐',
        title: '下载插件',
        desc: '从 NPM 下载插件包',
        code: 'await Downloader.downloadAndExtractPackage(pluginId, pluginDir)'
      },
      {
        layer: 'main',
        icon: '📦',
        title: '解压安装',
        desc: '解压到用户插件目录',
        code: 'fs.mkdirSync(pluginDir, { recursive: true })'
      },
      {
        layer: 'main',
        icon: '🔄',
        title: '重新加载',
        desc: '重新扫描插件目录',
        code: 'await userPluginDB.getAllPlugins()'
      },
      {
        layer: 'ipc',
        icon: '✅',
        title: '安装完成',
        desc: '返回安装成功',
        code: 'return { success: true }'
      },
      {
        layer: 'renderer',
        icon: '🎉',
        title: '更新状态',
        desc: '标记插件为已安装',
        code: 'installedPackages.value.add(pluginId)'
      }
    ]
  }
};

const currentScenario = computed(() => {
  return flowData[activeScenario.value];
});

const currentSteps = computed(() => {
  return currentScenario.value.steps;
});
</script>

<style scoped>
.flow-step {
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
