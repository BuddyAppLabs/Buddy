/**
 * AI管理器
 * 对buddy主应用中的AIManager进行封装，提供统一的AI服务接口
 * 实现Foundation的服务模式
 */
import { ChatMessage } from '@coffic/buddy-types';
import { AIContract, AIModelConfig, AIModelType } from './contracts/AIContract.js';
export declare class AIManager implements AIContract {
    private static instance;
    private originalAIManager;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): AIManager;
    /**
     * 初始化AI管理器
     * 从主进程获取原始的AIManager实例
     */
    initialize(aiManager: any): void;
    /**
     * 检查是否已初始化
     */
    private ensureInitialized;
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
//# sourceMappingURL=AIManager.d.ts.map