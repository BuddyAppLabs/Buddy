<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { SendablePlugin } from '@/types/sendable-plugin'
import { viewIpc } from '@/ui/ipc/view-ipc'
import { AppEvents } from '@coffic/buddy-types'

interface Props {
    plugin: SendablePlugin
}

const debug = false
const showView = true
const props = defineProps<Props>()
const container = ref<HTMLElement | null>(null)
const elementInfo = ref({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fullWidth: 0,
    fullHeight: 0,
})

const TOP_BAR_HEIGHT = 80;
const STATUS_BAR_HEIGHT = 40;

// 获取元素信息
const updateElementInfo = () => {
    if (container.value) {
        const rect = container.value.getBoundingClientRect()

        // 获取视口尺寸
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        // 计算可见的宽度
        const visibleLeft = Math.max(0, rect.left)
        const visibleRight = Math.min(viewportWidth, rect.right)
        const visibleWidth = Math.max(0, visibleRight - visibleLeft)

        // 计算可见的高度，考虑顶部topBar和底部statusBar
        const visibleTop = Math.max(TOP_BAR_HEIGHT, rect.top)
        const visibleBottom = Math.min(viewportHeight - STATUS_BAR_HEIGHT, rect.bottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)

        elementInfo.value = {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(visibleWidth),
            height: Math.round(visibleHeight),
            fullWidth: Math.round(rect.width),
            fullHeight: Math.round(rect.height),
        }
    }
}

// 创建背景图样式
const createInfoBackgroundImage = () => {
    const info = elementInfo.value
    const text = `坐标: (${info.x}, ${info.y}) | 可见: ${info.width}x${info.height} | 完整: ${info.fullWidth}x${info.fullHeight}`

    // 创建SVG背景图
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.3"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
            <rect width="100%" height="30" fill="rgba(0,0,0,0.8)"/>
            <text x="10" y="20" font-family="monospace" font-size="12" fill="white">${text}</text>
        </svg>
    `

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

// 简单节流函数
function throttle(fn: (...args: any[]) => void, delay: number) {
    let last = 0
    let timer: ReturnType<typeof setTimeout> | null = null
    return function (...args: any[]) {
        const now = Date.now()
        if (now - last > delay) {
            last = now
            fn(...args)
        } else {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                last = Date.now()
                fn(...args)
            }, delay - (now - last))
        }
    }
}

const throttledUpdateViewPosition = throttle(() => {
    if (props.plugin.pagePath) {
        const info = elementInfo.value
        const inTopBar = info.y < TOP_BAR_HEIGHT
        viewIpc.upsertView({
            x: info.x,
            y: info.y,
            width: info.width,
            height: inTopBar ? info.fullHeight : info.height,
            pagePath: props.plugin.pagePath,
        })
    }
}, 5)

onMounted(async () => {
    console.log('PluginPage: 挂载插件视图', props.plugin.pagePath)

    // 等待DOM渲染完成
    await nextTick()

    // 初始化元素信息
    updateElementInfo()

    // 监听窗口大小变化和滚动事件
    window.addEventListener('resize', updateElementInfo)
    window.addEventListener('scroll', updateElementInfo, true)

    // 监听窗口激活事件
    window.ipc.receive(AppEvents.ACTIVATED, () => {
        updateElementInfo()
    });
})

onUnmounted(() => {
    window.removeEventListener('resize', updateElementInfo)
    window.removeEventListener('scroll', updateElementInfo, true)
})

// 监听 container 的变化
watch(container, () => {
    updateElementInfo()
}, { flush: 'post' })

// 监听 elementInfo 变化，节流同步到 useViewLayoutManager
watch(elementInfo, () => {
    if (showView) {
        throttledUpdateViewPosition()
    }
})
</script>

<template>
    <div class="relative">
        <!-- 原始容器 -->
        <div class="h-56 w-full" :class="{ 'bg-red-500': debug }" ref="container"></div>

        <!-- 信息显示区域 - 以背景图形式在底部 -->
        <div v-if="debug" class="absolute top-0 left-0 right-0 h-8 z-10" :style="{
            backgroundImage: createInfoBackgroundImage(),
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
        }"></div>

        <!-- 信息显示区域 - 以背景图形式在底部 -->
        <div v-if="debug" class="absolute bottom-0 left-0 right-0 h-8 z-10" :style="{
            backgroundImage: createInfoBackgroundImage(),
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
        }"></div>
    </div>
</template>