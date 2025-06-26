/**
 * AI服务契约
 * 定义了AI管理器需要实现的方法
 */
import { ChatMessage } from '@coffic/buddy-types';
export type AIModelType = 'openai' | 'anthropic' | 'deepseek';
export interface AIModelConfig {
    type: AIModelType;
    modelName: string;
    apiKey: string;
    system?: string;
    temperature?: number;
    maxTokens?: number;
}
export interface AIContract {
    /**
     * 发送聊天消息
     * 返回流式响应
     */
    sendChatMessage(messages: ChatMessage[], onChunk: (chunk: string) => void, onFinish: () => void, modelConfig?: Partial<AIModelConfig>, requestId?: string): Promise<void>;
    /**
     * 取消指定ID的请求
     */
    cancelRequest(requestId: string): boolean;
    /**
     * 设置默认模型配置
     */
    setDefaultModel(config: Partial<AIModelConfig>): void;
    /**
     * 获取默认模型配置
     */
    getDefaultModelConfig(): AIModelConfig;
    /**
     * 获取支持的模型列表
     */
    getAvailableModels(): {
        [key in AIModelType]: string[];
    };
    /**
     * 重置配置
     */
    resetConfig(): void;
    /**
     * 启动AI服务
     */
    start(): Promise<void>;
    /**
     * 清理资源
     */
    cleanup(): void;
}
//# sourceMappingURL=AIContract.d.ts.map