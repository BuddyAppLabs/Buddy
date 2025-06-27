/**
 * AI Facade
 * 提供便捷的静态方法访问AI服务
 */
import { AIContract, AIModelConfig, AIModelType } from '../contracts/AIContract.js';
import { ChatMessage } from '@coffic/buddy-types';
export declare class AI {
    /** AI管理器实例 */
    private static manager;
    /**
     * 设置AI管理器实例
     * @param manager AI管理器
     */
    static setManager(manager: AIContract): void;
    /**
     * 获取AI管理器实例
     */
    static getManager(): AIContract;
    /**
     * 发送聊天消息
     */
    static sendChatMessage(messages: ChatMessage[], onChunk: (chunk: string) => void, onFinish: () => void, modelConfig?: Partial<AIModelConfig>, requestId?: string): Promise<void>;
    /**
     * 取消指定ID的请求
     */
    static cancelRequest(requestId: string): boolean;
    /**
     * 设置默认模型配置
     */
    static setDefaultModel(config: Partial<AIModelConfig>): void;
    /**
     * 获取默认模型配置
     */
    static getDefaultModelConfig(): AIModelConfig;
    /**
     * 获取支持的模型列表
     */
    static getAvailableModels(): {
        [key in AIModelType]: string[];
    };
    /**
     * 重置配置
     */
    static resetConfig(): void;
}
//# sourceMappingURL=AI.d.ts.map