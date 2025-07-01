<script setup lang="ts">
import { aiIpc } from '@renderer/ipc/ai-ipc';
import { ref, reactive, onMounted } from 'vue';
import { logger } from '@utils/logger';
import {
    ChatMessage,
    StreamChunkResponse,
    StreamDoneResponse,
    IAIModelConfig,
    IpcResponse,
    AIModelType,
} from '@coffic/buddy-types';
import ApiKeyInput from './ApiKeyInput.vue';

// 输入消息
const message = ref('');
// 消息列表
const messages = reactive<ChatMessage[]>([]);
// 当前请求ID
const currentRequestId = ref('');
// 加载状态
const loading = ref(false);
// AI正在回复的消息
const aiMessage = ref<{
    content: string;
    toolInvocation?: ChatMessage['toolInvocation'];
}>({
    content: '',
});
// 可用模型
const availableModels = ref<
    Record<'openai' | 'anthropic' | 'deepseek', string[]>
>({
    openai: [],
    anthropic: [],
    deepseek: [],
});
// 选中的模型
const selectedModel = ref<string>('');

// 注册流式响应处理
onMounted(async () => {
    // 获取可用模型
    try {
        const models = await aiIpc.getAvailableModels();
        if (models) {
            availableModels.value = models;
            // 设置默认选项
            if (models.openai && models.openai.length > 0) {
                selectedModel.value = `openai:${models.openai[0]}`;
            }
        }
    } catch (error) {
        logger.error('获取可用模型失败:', error);
    }

    // 注册流式聊天数据块监听器
    aiIpc.onAiChatStreamChunk((response: StreamChunkResponse) => {
        logger.info('AI响应:', response);
        if (response.success && response.data) {
            if (
                response.requestId === currentRequestId.value ||
                currentRequestId.value === ''
            ) {
                try {
                    const parsed = JSON.parse(response.data);
                    if (parsed.type === 'tool-call') {
                        aiMessage.value.toolInvocation = parsed.toolCall;
                    } else {
                        aiMessage.value.content += response.data;
                    }
                } catch (e) {
                    // 如果不是JSON，则视为普通文本
                    aiMessage.value.content += response.data;
                }
            } else {
                logger.warn('AI响应数据块，但是请求ID不匹配:', response);
            }
        } else if (response.error) {
            console.error('AI响应错误:', response.error);
        }
    });

    // 注册流式聊天完成监听器
    aiIpc.onAiChatStreamDone((response: StreamDoneResponse) => {
        if (response.requestId === currentRequestId.value) {
            // 将AI回复添加到消息列表
            if (aiMessage.value.content || aiMessage.value.toolInvocation) {
                messages.push({
                    role: 'assistant',
                    content: aiMessage.value.content,
                    toolInvocation: aiMessage.value.toolInvocation,
                });
            }
            // 重置状态
            aiMessage.value = { content: '' };
            loading.value = false;
            currentRequestId.value = '';
        }
    });
});

// 发送消息
async function sendMessage() {
    if (!message.value.trim() || loading.value) return;

    // 添加用户消息到列表
    messages.push({
        role: 'user',
        content: message.value,
    });

    // 清空输入框并设置加载状态
    message.value = '';
    loading.value = true;

    try {
        // 解析选中的模型
        const [type, modelName] = selectedModel.value.split(':');

        // 发送消息并获取请求ID
        const serializableMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));
        currentRequestId.value = await aiIpc.send(serializableMessages, {
            type: type as AIModelType,
            modelName,
        });
        logger.info('发送消息后得到的请求ID:', currentRequestId.value);
    } catch (error) {
        console.error('发送消息失败:', error);
        loading.value = false;
    }
}

// 处理按键事件，支持Ctrl+Enter发送
function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        sendMessage();
    }
}
</script>

<template>
    <div class="chat-container h-full flex flex-col bg-base-200 p-4">
        <!-- 消息列表区域 -->
        <div class="messages-container flex-1 overflow-y-auto mb-4 rounded-box bg-base-100 p-4">
            <div v-if="messages.length === 0"
                class="flex items-center justify-center h-full text-base-content opacity-50">
                <div class="text-center">
                    <h3 class="text-lg font-bold">开始与AI助手对话</h3>
                    <p>在下方输入框中输入您的问题，按发送按钮或Ctrl+Enter发送</p>
                </div>
            </div>

            <div v-else class="space-y-4">
                <!-- 历史消息 -->
                <div v-for="(msg, index) in messages" :key="index">
                    <div v-if="msg.toolInvocation?.toolName === 'require_api_key'">
                        <ApiKeyInput :provider="msg.toolInvocation.args.provider" />
                    </div>
                    <div v-else :class="['chat', msg.role === 'user' ? 'chat-end' : 'chat-start']">
                        <div class="chat-header opacity-75">
                            {{ msg.role === 'user' ? '你' : 'AI助手' }}
                        </div>
                        <div
                            :class="['chat-bubble', msg.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary']">
                            <div class="whitespace-pre-wrap">{{ msg.content }}</div>
                        </div>
                    </div>
                </div>

                <!-- AI正在回复 -->
                <div v-if="loading && aiMessage.content" class="chat chat-start">
                    <div class="chat-header opacity-75">AI助手</div>
                    <div class="chat-bubble chat-bubble-secondary">
                        <div class="whitespace-pre-wrap">{{ aiMessage.content }}</div>
                    </div>
                </div>

                <!-- 加载指示器 -->
                <div v-if="loading && !aiMessage.content" class="chat chat-start">
                    <div class="chat-bubble">
                        <span class="loading loading-dots loading-sm"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-container flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <select class="select select-bordered select-sm" v-model="selectedModel">
                    <optgroup v-for="(models, provider) in availableModels" :key="provider"
                        :label="provider.toUpperCase()">
                        <option v-for="model in models" :key="model" :value="`${provider}:${model}`">
                            {{ model }}
                        </option>
                    </optgroup>
                </select>
            </div>
            <div class="flex gap-2">
                <textarea class="textarea textarea-bordered flex-1" placeholder="输入消息..." v-model="message"
                    @keydown="handleKeydown" :disabled="loading" rows="3"></textarea>
                <button class="btn btn-primary self-end" @click="sendMessage" :disabled="loading || !message.trim()">
                    <span v-if="!loading">发送</span>
                    <span v-else class="loading loading-spinner loading-sm"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-container {
    max-height: 100vh;
}

.messages-container {
    scrollbar-width: thin;
}

.messages-container::-webkit-scrollbar {
    width: 6px;
}

.messages-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.whitespace-pre-wrap {
    white-space: pre-wrap;
}
</style>