<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/ui/stores/app-store'
import StatusBar from '@renderer/components/cosy/StatusBar.vue'
import StatusBarItem from '@renderer/components/cosy/StatusBarItem.vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// 跳转到首页
const goToHome = () => {
    router.push('/')
    appStore.setView('home')
}

// 跳转到插件商店
const goToPluginStore = () => {
    router.push('/plugins')
    appStore.setView('plugins')
}

// 跳转到聊天界面
const goToChat = () => {
    router.push('/chat')
    appStore.setView('chat')
}
</script>

<template>
    <StatusBar>
        <!-- 左侧导航按钮 -->
        <template #left>
            <StatusBarItem clickable @click="goToHome" :active="route.path === '/'"
                :variant="route.path === '/' ? 'primary' : 'default'">
                首页
            </StatusBarItem>
            <StatusBarItem clickable @click="goToPluginStore" :active="route.path === '/plugins'"
                :variant="route.path === '/plugins' ? 'primary' : 'default'">
                插件商店
            </StatusBarItem>
            <StatusBarItem clickable @click="goToChat" :active="route.path === '/chat'"
                :variant="route.path === '/chat' ? 'primary' : 'default'">
                聊天
            </StatusBarItem>
        </template>
    </StatusBar>
</template>