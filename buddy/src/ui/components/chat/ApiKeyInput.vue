<script setup lang="ts">
import { ref } from 'vue';
import { aiIpc } from '@renderer/ipc/ai-ipc';
import { AIModelType } from '@coffic/buddy-types';

const props = defineProps<{
    provider: AIModelType;
}>();

const apiKey = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

async function submitApiKey() {
    if (!apiKey.value.trim()) {
        error.value = 'API Key不能为空';
        return;
    }
    loading.value = true;
    error.value = '';
    success.value = false;

    try {
        await aiIpc.setApiKey(props.provider, apiKey.value);
        success.value = true;
        // 可以在这里触发一个事件，通知父组件Key已设置，可以重新发送消息了
    } catch (e: any) {
        error.value = e.message || '设置API Key失败';
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="p-4 my-4 bg-warning/10 border border-warning/20 rounded-lg">
        <div class="prose">
            <h4>需要API密钥</h4>
            <p>
                模型
                <span class="font-bold text-warning">{{ props.provider.toUpperCase() }}</span>
                需要一个API密钥才能继续。请在下方输入您的密钥。
            </p>
        </div>
        <div class="form-control mt-4">
            <div class="join">
                <input v-model="apiKey" type="password" :placeholder="`${props.provider.toUpperCase()} API Key`"
                    class="input input-bordered join-item flex-1" :disabled="loading" />
                <button class="btn btn-warning join-item" @click="submitApiKey" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner"></span>
                    提交
                </button>
            </div>
            <label v-if="error" class="label">
                <span class="label-text-alt text-error">{{ error }}</span>
            </label>
            <label v-if="success" class="label">
                <span class="label-text-alt text-success">API Key已保存！请重新发送您的问题。</span>
            </label>
        </div>
    </div>
</template>