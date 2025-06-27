/**
 * AI管理器
 * 对buddy主应用中的AIManager进行封装，提供统一的AI服务接口
 * 实现Foundation的服务模式
 */

import { ChatMessage } from '@coffic/buddy-types';
import { AIContract, AIModelConfig, AIModelType } from './contracts/AIContract.js';

export class AIManager implements AIContract {
    private static instance: AIManager;
    private originalAIManager: any = null;

    private constructor() {
        // 私有构造函数，确保单例模式
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): AIManager {
        if (!AIManager.instance) {
            AIManager.instance = new AIManager();
        }
        return AIManager.instance;
    }

    /**
     * 初始化AI管理器
     * 从主进程获取原始的AIManager实例
     */
    public initialize(aiManager: any): void {
        this.originalAIManager = aiManager;
    }

    /**
     * 检查是否已初始化
     */
    private ensureInitialized(): void {
        if (!this.originalAIManager) {
            throw new Error('AI管理器未初始化，请先调用 initialize() 方法');
        }
    }

    /**
     * 发送聊天消息
     * 返回流式响应
     */
    public async sendChatMessage(
        messages: ChatMessage[],
        onChunk: (chunk: string) => void,
        onFinish: () => void,
        modelConfig?: Partial<AIModelConfig>,
        requestId?: string
    ): Promise<void> {
        this.ensureInitialized();
        return this.originalAIManager.sendChatMessage(
            messages,
            onChunk,
            onFinish,
            modelConfig,
            requestId
        );
    }

    /**
     * 取消指定ID的请求
     */
    public cancelRequest(requestId: string): boolean {
        this.ensureInitialized();
        return this.originalAIManager.cancelRequest(requestId);
    }

    /**
     * 设置默认模型配置
     */
    public setDefaultModel(config: Partial<AIModelConfig>): void {
        this.ensureInitialized();
        this.originalAIManager.setDefaultModel(config);
    }

    /**
     * 获取默认模型配置
     */
    public getDefaultModelConfig(): AIModelConfig {
        this.ensureInitialized();
        return this.originalAIManager.getDefaultModelConfig();
    }

    /**
     * 获取支持的模型列表
     */
    public getAvailableModels(): { [key in AIModelType]: string[] } {
        this.ensureInitialized();
        return this.originalAIManager.getAvailableModels();
    }

    /**
     * 重置配置
     */
    public resetConfig(): void {
        this.ensureInitialized();
        this.originalAIManager.resetConfig();
    }

    /**
     * 启动AI服务
     */
    public async start(): Promise<void> {
    }

    /**
     * 清理资源
     */
    public cleanup(): void {
        // 清理AI服务相关资源
        console.log('AI服务资源已清理');
    }
} 