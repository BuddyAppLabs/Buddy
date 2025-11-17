import {
  streamText,
  wrapLanguageModel,
  extractReasoningMiddleware,
  simulateStreamingMiddleware,
  convertToModelMessages,
  type UIMessage,
} from 'ai';
import { getTools } from './tools';
import { logMiddleware } from './middleware/log.mid';
import { getAllProvidersWithModels, getModel } from './providers';
import type { CreateStreamParams, ProviderResult, ProviderName } from './types';

const title = '[ChatService]';

/**
 * 供应商元数据（URL和描述）
 * 这些信息用于前端显示
 */
export const PROVIDER_METADATA: Record<
  ProviderName,
  { url: string; description: string }
> = {
  openai: {
    url: 'https://platform.openai.com/api-keys',
    description: 'OpenAI 提供 GPT-4、GPT-3.5 等先进的语言模型',
  },
  deepseek: {
    url: 'https://platform.deepseek.com/api_keys',
    description: 'DeepSeek 提供高性价比的中文优化模型',
  },
  anthropic: {
    url: 'https://console.anthropic.com/settings/keys',
    description: 'Anthropic 提供 Claude 系列模型，擅长长文本处理',
  },
  openrouter: {
    url: 'https://openrouter.ai/keys',
    description: 'OpenRouter 提供多个AI模型的统一接口，包括免费模型',
  },
  megallm: {
    url: 'https://ai.megallm.io',
    description:
      'MegaLLM 提供多个顶级 AI 模型的统一接口，包括 Claude、GPT-4、Gemini',
  },
};

/**
 * 供应商信息接口（用于前端）
 */
export interface ProviderInfo {
  type: ProviderName;
  name: string;
  apiKey: string;
  url: string;
  description: string;
  models: Array<{ id: string; name: string }>;
}

/**
 * 对话仓库接口
 * 如果不需要保存对话历史，可以实现一个空实现
 */
export interface ConversationRepository {
  saveMessages(conversationId: string, messages: UIMessage[]): Promise<void>;
}

/**
 * 空的对话仓库实现（不保存对话历史）
 */
class EmptyConversationRepository implements ConversationRepository {
  async saveMessages(
    _conversationId: string,
    _messages: UIMessage[]
  ): Promise<void> {
    // 不保存对话历史
  }
}

export class ChatService {
  private conversationRepo: ConversationRepository;

  constructor(conversationRepo?: ConversationRepository) {
    this.conversationRepo =
      conversationRepo || new EmptyConversationRepository();
  }

  async createStream(options: CreateStreamParams): Promise<any> {
    const {
      provider,
      modelName,
      key,
      messages,
      user,
      conversationId,
      systemPrompt,
      dashScopeApiKey,
    } = options;
    const { model, tagName } = getModel(provider, modelName, key);
    const conversationRepo = this.conversationRepo;

    // ✅ 确保 messages 是 UIMessage[] 数组格式
    const uiMessages: UIMessage[] = Array.isArray(messages) ? messages : [];
    console.log(`${title} 接收到的消息:`, JSON.stringify(uiMessages));

    // ✅ 清理消息：移除不完整的工具调用链
    // 原因：AI SDK 5.0 要求 assistant 消息如果有 tool_calls，后面必须紧跟对应的 tool 消息
    const cleanedMessages = this.cleanToolMessages(uiMessages);
    console.log(`${title} 清理后的消息:`, JSON.stringify(cleanedMessages));

    // ✅ 转换为 ModelMessage[] 格式（AI 模型需要的格式）
    console.log(`${title} 准备调用 convertToModelMessages`);
    const modelMessages = convertToModelMessages(cleanedMessages);
    console.log(`${title} 转换后的消息:`, JSON.stringify(modelMessages));

    // 获取所有工具
    const { tools } = await getTools(user, dashScopeApiKey);

    // 🔍 临时禁用工具进行调试
    const useTools = false;

    console.log(`${title} 开始调用 streamText`, {
      provider,
      modelName,
      systemPrompt,
      messageCount: modelMessages.length,
      toolCount: useTools ? Object.keys(tools).length : 0,
      toolsEnabled: useTools,
    });

    const result = streamText({
      model: wrapLanguageModel({
        model: model,
        middleware: [
          extractReasoningMiddleware({ tagName }),
          // simulateStreamingMiddleware(), // 移除模拟流式，使用真实流式
          logMiddleware,
        ],
      }),
      system: systemPrompt,
      messages: modelMessages, // ✅ 使用转换后的 ModelMessage[]
      ...(useTools ? { tools } : {}), // 条件性添加工具
      // maxSteps/maxToolRoundtrips 在当前版本不可用
      // 工具会自动执行并返回结果
      onError: (error) => {
        console.error(`${title} ❌ onError:`, error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error(`${title} 错误消息:`, errorMessage);
        if (errorStack) {
          console.error(`${title} 错误堆栈:`, errorStack);
        }
        // 如果错误对象有其他属性，也打印出来
        if (error && typeof error === 'object') {
          console.error(`${title} 错误详情:`, JSON.stringify(error, null, 2));
        }
      },
      onFinish: async ({ text, finishReason, usage, steps }) => {
        console.log(`${title} ✅ onFinish`, {
          finishReason,
          usage,
          steps: steps?.length,
          textLength: text?.length || 0,
        });

        // 如果 finishReason 是 unknown 且没有文本，说明可能有问题
        if (finishReason === 'unknown' && (!text || text.length === 0)) {
          console.warn(
            `${title} ⚠️  警告: AI 没有生成任何响应，可能是 API 密钥无效或网络问题`
          );
        }

        if (conversationId) {
          try {
            // 构建完整的消息历史
            const assistantMessage: UIMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              parts: [{ type: 'text', text }],
            };
            const finalMessages = [...cleanedMessages, assistantMessage];
            await conversationRepo.saveMessages(conversationId, finalMessages);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            console.error(`${title} 保存消息失败:`, errorMessage);
            // 不影响聊天流程，只记录错误
          }
        }
      },
    });

    // 返回 StreamTextResult 对象，它有 textStream 属性
    return result;
  }

  /**
   * 清理工具调用消息，确保符合 AI SDK 5.0 的格式要求
   *
   * 规则：
   * 1. 如果 assistant 消息包含 tool_calls，但后续没有对应的 tool 消息，移除该 tool_calls
   * 2. 移除孤立的 tool 消息（没有对应的 tool_calls）
   * 3. 合并连续的相同角色消息（避免 user-user 或 assistant-assistant 的情况）
   */
  private cleanToolMessages(messages: UIMessage[]): UIMessage[] {
    const cleaned: UIMessage[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      // 如果是 assistant 消息，检查是否有未完成的 tool_calls
      if (msg.role === 'assistant') {
        const hasPendingToolCalls = msg.parts?.some(
          (part: any) => part.type === 'tool-call'
        );

        if (hasPendingToolCalls) {
          // 检查下一条消息是否是 tool 响应
          const nextMsg = messages[i + 1];
          const hasToolResponse = false;

          if (!hasToolResponse) {
            // 没有 tool 响应，移除 tool-call parts
            console.log(`${title} 移除未完成的 tool-call:`, msg.id);
            const cleanedParts = msg.parts?.filter(
              (part: any) => part.type !== 'tool-call'
            );
            cleaned.push({ ...msg, parts: cleanedParts });
            continue;
          }
        }
      }

      // 检查是否与上一条消息角色相同
      const lastMsg = cleaned[cleaned.length - 1];
      if (lastMsg && lastMsg.role === msg.role) {
        // 合并消息内容
        console.log(`${title} 合并连续的 ${msg.role} 消息`);
        lastMsg.parts = [...(lastMsg.parts || []), ...(msg.parts || [])];
      } else {
        cleaned.push(msg);
      }
    }

    console.log(
      `${title} 消息清理完成: ${messages.length} -> ${cleaned.length}`
    );
    return cleaned;
  }

  /**
   * 生成文本（非流式）
   * 用于简单的文本生成场景
   */
  async generateText(options: CreateStreamParams): Promise<string> {
    const { provider, modelName, key, messages, systemPrompt } = options;
    const { model } = getModel(provider, modelName, key);

    // 确保 messages 是 UIMessage[] 数组格式
    const uiMessages: UIMessage[] = Array.isArray(messages) ? messages : [];

    // 清理消息
    const cleanedMessages = this.cleanToolMessages(uiMessages);

    // 转换为 ModelMessage[] 格式
    const modelMessages = convertToModelMessages(cleanedMessages);

    console.log(`${title} generateText 调用`, {
      provider,
      modelName,
      messageCount: modelMessages.length,
    });

    const result = await streamText({
      model,
      system: systemPrompt,
      messages: modelMessages,
    });

    // 收集所有文本块
    let fullText = '';
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    return fullText;
  }

  /**
   * 获取所有支持的供应商及其模型列表
   */
  static getSupportedProvidersAndModels(): ProviderResult[] {
    return getAllProvidersWithModels();
  }

  /**
   * 获取所有供应商信息（包含元数据）
   * 通过ChatService.getSupportedProvidersAndModels()获取所有供应商和模型
   */
  static getAllProvidersWithMetadata(): ProviderInfo[] {
    const providersAndModels = ChatService.getSupportedProvidersAndModels();
    console.log(
      `${title} getAllProvidersWithMetadata - providers:`,
      providersAndModels.map((p) => p.provider_name)
    );

    const result = providersAndModels.map((item) => {
      const providerName = item.provider_name as ProviderName;
      const metadata = PROVIDER_METADATA[providerName];

      // 格式化供应商名称
      const displayName =
        providerName === 'openrouter'
          ? 'OpenRouter'
          : providerName.charAt(0).toUpperCase() + providerName.slice(1);

      return {
        type: providerName,
        name: displayName,
        apiKey: '',
        url: metadata?.url || '',
        description: metadata?.description || '',
        models: item.models.map((modelName: string) => ({
          id: modelName,
          name: modelName,
        })),
      };
    });

    console.log(
      `${title} getAllProvidersWithMetadata - result:`,
      result.map((p) => p.type)
    );
    return result;
  }
}

// Named export for convenience
export const getAllProvidersWithMetadata =
  ChatService.getAllProvidersWithMetadata;
