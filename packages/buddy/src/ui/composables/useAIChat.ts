import { ref, Ref, onUnmounted, onMounted, watch } from 'vue';
import { IPC_METHODS } from '@/types/ipc-methods';

const ipc = window.ipc;
const verbose = true;

export interface MessagePart {
  type: 'text';
  text: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: MessagePart[];
  createdAt?: Date;
}

export interface Provider {
  type: string;
  name: string;
  models: Model[];
}

export interface Model {
  id: string;
  name: string;
  provider: string;
}

export interface UseAIChatOptions {
  initialModel?: string;
  initialMessages?: Message[];
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const { initialModel, initialMessages = [] } = options;

  const messages: Ref<Message[]> = ref([...initialMessages]);
  const input = ref('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  // localStorage 键名
  const STORAGE_KEY_PROVIDER = 'ai-chat-selected-provider';
  const STORAGE_KEY_MODEL = 'ai-chat-selected-model';

  // 从 localStorage 恢复上次选择
  const savedProvider = localStorage.getItem(STORAGE_KEY_PROVIDER);
  const savedModel = localStorage.getItem(STORAGE_KEY_MODEL);

  // 供应商和模型
  const providers = ref<Provider[]>([]);
  const models = ref<Model[]>([]);
  const selectedModel = ref(initialModel || savedModel || '');
  const selectedProvider = ref(savedProvider || '');

  // 监听流式响应
  const handleStreamData = (textPart: string) => {
    if (verbose) {
      console.log('[useAIChat] 收到流式数据:', textPart.substring(0, 50));
    }
    const lastMessage = messages.value[messages.value.length - 1];
    if (verbose) {
      console.log(
        '[useAIChat] 最后一条消息:',
        lastMessage?.role,
        lastMessage?.id
      );
    }
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.parts.length > 0
    ) {
      if (verbose) {
        console.log(
          '[useAIChat] 更新助手消息，当前长度:',
          lastMessage.parts[0].text.length
        );
      }
      // 直接修改对象属性来触发Vue的响应式更新
      lastMessage.parts[0].text += textPart;
      // 强制触发响应式更新
      messages.value = [...messages.value];
      if (verbose) {
        console.log(
          '[useAIChat] 更新后长度:',
          lastMessage.parts[0].text.length
        );
      }
    } else {
      if (verbose) {
        console.warn('[useAIChat] 无法更新消息，lastMessage:', lastMessage);
      }
    }
  };

  // 处理工具调用
  const handleToolCall = (data: any) => {
    console.log('[useAIChat] 收到工具调用:', data);
    const lastMessage = messages.value[messages.value.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      // 添加工具调用信息到消息的 parts 中
      const toolPart = {
        type: 'tool-call' as const,
        toolCallId: data.toolCallId,
        toolName: data.toolName,
        args: data.args,
      };
      lastMessage.parts.push(toolPart);
    }
  };

  // 处理工具结果
  const handleToolResult = (data: any) => {
    console.log('[useAIChat] 收到工具结果:', data);
    const lastMessage = messages.value[messages.value.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      // 查找对应的工具调用，更新结果
      const toolCallPart = lastMessage.parts.find(
        (p: any) => p.type === 'tool-call' && p.toolCallId === data.toolCallId
      );
      if (toolCallPart) {
        (toolCallPart as any).result = data.result;
      }
    }
  };

  // 处理流错误
  const handleStreamError = (data: any) => {
    console.error('[useAIChat] 收到流错误:', data);
    isLoading.value = false;
    error.value = data.error || 'AI 响应出错';

    // 移除空的助手消息
    const lastMessage = messages.value[messages.value.length - 1];
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      (!lastMessage.parts[0] || !lastMessage.parts[0].text)
    ) {
      messages.value = messages.value.slice(0, -1);
    }
  };

  // 注册流式响应监听器
  if (ipc) {
    if (verbose) {
      console.log('[useAIChat] 注册流式响应监听器');
    }
    ipc.receive('ai-chat-stream', handleStreamData);
    ipc.receive('ai-chat-tool-call', handleToolCall);
    ipc.receive('ai-chat-tool-result', handleToolResult);
    ipc.receive('ai-chat-error', handleStreamError);
  } else {
    console.error('[useAIChat] IPC 不可用');
  }

  // 清理监听器
  onUnmounted(() => {
    if (ipc) {
      ipc.removeListener('ai-chat-stream', handleStreamData);
      ipc.removeListener('ai-chat-tool-call', handleToolCall);
      ipc.removeListener('ai-chat-tool-result', handleToolResult);
      ipc.removeListener('ai-chat-error', handleStreamError);
    }
  });

  const sendMessage = async () => {
    if (!input.value.trim() || isLoading.value) return;
    if (verbose) {
      console.log('[useAIChat] 开始发送消息');
    }
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', text: input.value }],
      createdAt: new Date(),
    };

    messages.value.push(userMessage);
    const userInput = input.value;
    input.value = '';
    isLoading.value = true;
    error.value = null;

    // 创建助手消息占位符
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      parts: [{ type: 'text', text: '' }],
      createdAt: new Date(),
    };
    messages.value.push(assistantMessage);

    try {
      if (verbose) {
        console.log('[useAIChat] 准备调用 IPC', {
          model: selectedModel.value,
          messageCount: messages.value.length,
        });
      }

      // 使用 IPC 发送消息
      // 转换为 UIMessage 格式（AI SDK 需要的格式）
      // UIMessage 格式需要 parts 数组，而不是简单的 content 字符串
      const uiMessages = messages.value
        .filter(
          (m) =>
            m.role !== 'assistant' || (m.parts.length > 0 && m.parts[0].text)
        )
        .map((m) => ({
          id: m.id,
          role: m.role,
          parts: m.parts.map((p) => ({
            type: 'text' as const,
            text: p.text,
          })),
        }));

      if (verbose) {
        console.log('[useAIChat] 发送的消息:', JSON.stringify(uiMessages));
      }

      const response = await ipc.invoke(
        IPC_METHODS.AI_CHAT_SEND,
        selectedModel.value,
        uiMessages
      );

      if (verbose) {
        console.log('[useAIChat] IPC 响应', response);
      }

      // 检查是否有双重包装
      let actualResponse = response;
      if (
        response.success &&
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data
      ) {
        if (verbose) {
          console.log('[useAIChat] 检测到双重包装的响应');
        }
        actualResponse = response.data;
      }

      if (!actualResponse.success) {
        throw new Error(actualResponse.error || 'Unknown error');
      }

      if (verbose) {
        console.log('[useAIChat] 消息发送成功');
      }

      // 显示成功提示（如果助手有回复）
      if (assistantMessage.parts.length > 0 && assistantMessage.parts[0].text) {
        successMessage.value = '✅ 回复完成';
        setTimeout(() => {
          successMessage.value = null;
        }, 3000);
      }
    } catch (e) {
      if (verbose) {
        console.error('[useAIChat] 发送失败:', e);
      }
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      error.value = errorMsg;

      // 移除失败的助手消息
      messages.value = messages.value.filter(
        (m) => m.id !== assistantMessage.id
      );
      // 恢复用户输入
      input.value = userInput;
    } finally {
      isLoading.value = false;
    }
  };

  const clearMessages = () => {
    messages.value = [];
    error.value = null;
  };

  const retry = () => {
    if (messages.value.length > 0) {
      const lastUserMessage = [...messages.value]
        .reverse()
        .find((m) => m.role === 'user');
      if (lastUserMessage && lastUserMessage.parts.length > 0) {
        input.value = lastUserMessage.parts.map((p) => p.text).join('');
        // 移除最后的用户消息和可能的失败助手消息
        const lastUserIndex = messages.value.findIndex(
          (m) => m.id === lastUserMessage.id
        );
        messages.value = messages.value.slice(0, lastUserIndex);
        sendMessage();
      }
    }
  };

  // 加载供应商和模型列表
  const loadProviders = async () => {
    try {
      const response = await ipc.invoke(IPC_METHODS.AI_GET_PROVIDERS);
      if (verbose) {
        console.log('[useAIChat] 供应商响应:', response);
      }

      if (response.success) {
        // response.data 可能是数组，也可能是 { success, data } 对象
        let data = response.data;

        // 如果 data 是对象且有 data 属性，说明是双重包装
        if (data && typeof data === 'object' && 'data' in data) {
          data = data.data;
        }

        // 确保 data 是数组
        if (Array.isArray(data)) {
          providers.value = data;
          if (verbose) {
            console.log(
              '[useAIChat] 加载供应商列表，数量:',
              providers.value.length
            );
          }

          // 如果没有指定初始模型，使用第一个供应商作为默认值
          if (!initialModel && data.length > 0) {
            selectedProvider.value = data[0].type;
            if (verbose) {
              console.log(
                '[useAIChat] 使用第一个供应商作为默认:',
                selectedProvider.value
              );
            }
          }
        } else {
          if (verbose) {
            console.error('[useAIChat] 供应商数据不是数组:', data);
          }
          providers.value = [];
        }
      }
    } catch (e) {
      if (verbose) {
        console.error('[useAIChat] 加载供应商失败:', e);
      }
    }
  };

  const loadModels = async () => {
    try {
      const response = await ipc.invoke(IPC_METHODS.AI_GET_MODELS);
      if (verbose) {
        console.log('[useAIChat] 模型响应:', response);
      }

      if (response.success) {
        // response.data 可能是数组，也可能是 { success, data } 对象
        let data = response.data;

        // 如果 data 是对象且有 data 属性，说明是双重包装
        if (data && typeof data === 'object' && 'data' in data) {
          if (verbose) {
            console.log('[useAIChat] 检测到双重包装，提取内层 data');
          }
          data = data.data;
        }

        // 确保 data 是数组
        if (Array.isArray(data)) {
          models.value = data;
          if (verbose) {
            console.log(
              '[useAIChat] 成功加载模型列表，数量:',
              models.value.length
            );
          }
        } else {
          if (verbose) {
            console.error('[useAIChat] 模型数据不是数组:', data);
          }
          models.value = [];
        }
      }
    } catch (e) {
      if (verbose) {
        console.error('[useAIChat] 加载模型失败:', e);
      }
    }
  };

  // 切换供应商时，选择该供应商的第一个模型
  const changeProvider = (providerType: string) => {
    selectedProvider.value = providerType;
    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEY_PROVIDER, providerType);

    if (!Array.isArray(models.value)) {
      if (verbose) {
        console.error('[useAIChat] models.value 不是数组:', models.value);
      }
      return;
    }

    const providerModels = models.value.filter(
      (m) => m.provider === providerType
    );
    if (providerModels.length > 0) {
      selectedModel.value = providerModels[0].id;
      // 保存到 localStorage
      localStorage.setItem(STORAGE_KEY_MODEL, providerModels[0].id);
    }
  };

  // 获取当前供应商的模型列表
  const getProviderModels = () => {
    if (!Array.isArray(models.value)) {
      if (verbose) {
        console.error('[useAIChat] models.value 不是数组:', models.value);
      }
      return [];
    }
    return models.value.filter((m) => m.provider === selectedProvider.value);
  };

  // 监听模型选择变化，保存到 localStorage
  watch(selectedModel, (newModel) => {
    if (newModel) {
      localStorage.setItem(STORAGE_KEY_MODEL, newModel);
      if (verbose) {
        console.log('[useAIChat] 保存模型选择到 localStorage:', newModel);
      }
    }
  });

  // 监听供应商选择变化，保存到 localStorage
  watch(selectedProvider, (newProvider) => {
    if (newProvider) {
      localStorage.setItem(STORAGE_KEY_PROVIDER, newProvider);
      if (verbose) {
        console.log('[useAIChat] 保存供应商选择到 localStorage:', newProvider);
      }
    }
  });

  // 初始化
  onMounted(async () => {
    await loadProviders();
    await loadModels();

    // 如果没有指定初始模型，且已经选择了供应商，自动选择该供应商的第一个模型
    if (verbose) {
      console.log('[useAIChat] 初始化完成，检查模型选择', {
        initialModel,
        savedProvider,
        savedModel,
        selectedProvider: selectedProvider.value,
        selectedModel: selectedModel.value,
        modelsCount: models.value.length,
      });
    }

    // 优先级：initialModel > savedModel > 第一个模型
    if (!initialModel && models.value.length > 0) {
      // 如果有保存的供应商和模型，验证它们是否仍然有效
      if (savedProvider && savedModel) {
        const savedModelExists = models.value.find((m) => m.id === savedModel);
        if (savedModelExists) {
          selectedProvider.value = savedProvider;
          selectedModel.value = savedModel;
          if (verbose) {
            console.log('[useAIChat] 恢复上次选择:', {
              provider: savedProvider,
              model: savedModel,
            });
          }
          return;
        }
      }

      // 如果没有有效的保存记录，选择第一个供应商的第一个模型
      if (selectedProvider.value && models.value.length > 0) {
        const providerModels = models.value.filter(
          (m) => m.provider === selectedProvider.value
        );
        if (verbose) {
          console.log('[useAIChat] 当前供应商的模型:', providerModels);
        }

        if (providerModels.length > 0) {
          selectedModel.value = providerModels[0].id;
          // 保存到 localStorage
          localStorage.setItem(STORAGE_KEY_PROVIDER, selectedProvider.value);
          localStorage.setItem(STORAGE_KEY_MODEL, providerModels[0].id);
          if (verbose) {
            console.log('[useAIChat] 自动选择第一个模型:', selectedModel.value);
          }
        }
      }
    }
  });

  return {
    messages,
    input,
    isLoading,
    error,
    successMessage,
    providers,
    models,
    selectedProvider,
    selectedModel,
    sendMessage,
    clearMessages,
    retry,
    changeProvider,
    getProviderModels,
  };
}
