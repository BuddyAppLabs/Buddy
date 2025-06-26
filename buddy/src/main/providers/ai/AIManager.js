/**
 * AI管理器
 * 对buddy主应用中的AIManager进行封装，提供统一的AI服务接口
 * 实现Foundation的服务模式
 */
export class AIManager {
    static instance;
    originalAIManager = null;
    constructor() {
        // 私有构造函数，确保单例模式
    }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!AIManager.instance) {
            AIManager.instance = new AIManager();
        }
        return AIManager.instance;
    }
    /**
     * 初始化AI管理器
     * 从主进程获取原始的AIManager实例
     */
    initialize(aiManager) {
        this.originalAIManager = aiManager;
    }
    /**
     * 检查是否已初始化
     */
    ensureInitialized() {
        if (!this.originalAIManager) {
            throw new Error('AI管理器未初始化，请先调用 initialize() 方法');
        }
    }
    /**
     * 发送聊天消息
     * 返回流式响应
     */
    async sendChatMessage(messages, onChunk, onFinish, modelConfig, requestId) {
        this.ensureInitialized();
        return this.originalAIManager.sendChatMessage(messages, onChunk, onFinish, modelConfig, requestId);
    }
    /**
     * 取消指定ID的请求
     */
    cancelRequest(requestId) {
        this.ensureInitialized();
        return this.originalAIManager.cancelRequest(requestId);
    }
    /**
     * 设置默认模型配置
     */
    setDefaultModel(config) {
        this.ensureInitialized();
        this.originalAIManager.setDefaultModel(config);
    }
    /**
     * 获取默认模型配置
     */
    getDefaultModelConfig() {
        this.ensureInitialized();
        return this.originalAIManager.getDefaultModelConfig();
    }
    /**
     * 获取支持的模型列表
     */
    getAvailableModels() {
        this.ensureInitialized();
        return this.originalAIManager.getAvailableModels();
    }
    /**
     * 重置配置
     */
    resetConfig() {
        this.ensureInitialized();
        this.originalAIManager.resetConfig();
    }
    /**
     * 启动AI服务
     */
    async start() {
    }
    /**
     * 清理资源
     */
    cleanup() {
        // 清理AI服务相关资源
        console.log('AI服务资源已清理');
    }
}
//# sourceMappingURL=AIManager.js.map