<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { SendablePlugin } from '@/types/sendable-plugin'
import { useViewLayoutManager } from '@renderer/composables/useViewLayoutManager'

interface Props {
    plugin: SendablePlugin
}

const props = defineProps<Props>()
const container = ref<HTMLElement | null>(null)
const { registerView, unregisterView } = useViewLayoutManager()

onMounted(async () => {
    console.log('PluginPage: 挂载插件视图', props.plugin.pagePath)

    // 等待DOM渲染完成
    await nextTick()

    // 注册到集中式管理器
    if (container.value && props.plugin.pagePath) {
        registerView(props.plugin.pagePath, container.value)
    }
})

onUnmounted(() => {
    console.log('PluginPage: 卸载插件视图', props.plugin.pagePath)

    // 从集中式管理器注销
    if (props.plugin.pagePath) {
        unregisterView(props.plugin.pagePath)
    }
})
</script>

<template>
    <div class="h-56 w-full" ref="container"></div>
</template>