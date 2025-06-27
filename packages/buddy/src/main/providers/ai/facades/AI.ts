/**
 * AI Facade
 * 提供便捷的静态方法访问AI服务
 */

import { AIContract, AIModelConfig, AIModelType } from '../contracts/AIContract.js';
import { ChatMessage } from '@coffic/buddy-types';

export class AI {
    /** AI管理器实例 */
    private static manager: AIContract | null = null;

    /**
     * 设置AI管理器实例
     * @param manager AI管理器
     */
    static setManager(manager: AIContract): void {
        AI.manager = manager;
    }

    /**
     * 获取AI管理器实例
     */
    static getManager(): AIContract {
        if (!AI.manager) {
            throw new Error('AI管理器尚未设置，请先调用 AI.setManager()');
        }
        return AI.manager;
    }

    /**
     * 发送聊天消息
     */
    public static async sendChatMessage(
        messages: ChatMessage[],
        onChunk: (chunk: string) => void,
        onFinish: () => void,
        modelConfig?: Partial<AIModelConfig>,
        requestId?: string
    ): Promise<void> {
        return AI.getManager().sendChatMessage(messages, onChunk, onFinish, modelConfig, requestId);
    }

    /**
     * 取消指定ID的请求
     */
    public static cancelRequest(requestId: string): boolean {
        return AI.getManager().cancelRequest(requestId);
    }

    /**
     * 设置默认模型配置
     */
    public static setDefaultModel(config: Partial<AIModelConfig>): void {
        return AI.getManager().setDefaultModel(config);
    }

    /**
     * 获取默认模型配置
     */
    public static getDefaultModelConfig(): AIModelConfig {
        return AI.getManager().getDefaultModelConfig();
    }

    /**
     * 获取支持的模型列表
     */
    public static getAvailableModels(): { [key in AIModelType]: string[] } {
        return AI.getManager().getAvailableModels();
    }

    /**
     * 重置配置
     */
    public static resetConfig(): void {
        return AI.getManager().resetConfig();
    }
} 