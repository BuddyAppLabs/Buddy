// AI模型类型
export type AIModelType = 'openai' | 'anthropic' | 'deepseek';

// AI模型配置
export interface IAIModelConfig {
  type: AIModelType;
  modelName: string;
  apiKey?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  toolInvocation?: {
    toolCallId: string;
    toolName: string;
    args: any;
  };
}

// 流式响应类型
export interface StreamChunkResponse {
  success: boolean;
  data?: string;
  error?: string;
  requestId: string;
}

// 流式完成响应类型
export interface StreamDoneResponse {
  success: boolean;
  requestId: string;
}
