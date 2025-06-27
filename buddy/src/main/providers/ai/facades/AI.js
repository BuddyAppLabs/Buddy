/**
 * AI Facade
 * 提供便捷的静态方法访问AI服务
 */
export class AI {
    /** AI管理器实例 */
    static manager = null;
    /**
     * 设置AI管理器实例
     * @param manager AI管理器
     */
    static setManager(manager) {
        AI.manager = manager;
    }
    /**
     * 获取AI管理器实例
     */
    static getManager() {
        if (!AI.manager) {
            throw new Error('AI管理器尚未设置，请先调用 AI.setManager()');
        }
        return AI.manager;
    }
    /**
     * 发送聊天消息
     */
    static async sendChatMessage(messages, onChunk, onFinish, modelConfig, requestId) {
        return AI.getManager().sendChatMessage(messages, onChunk, onFinish, modelConfig, requestId);
    }
    /**
     * 取消指定ID的请求
     */
    static cancelRequest(requestId) {
        return AI.getManager().cancelRequest(requestId);
    }
    /**
     * 设置默认模型配置
     */
    static setDefaultModel(config) {
        return AI.getManager().setDefaultModel(config);
    }
    /**
     * 获取默认模型配置
     */
    static getDefaultModelConfig() {
        return AI.getManager().getDefaultModelConfig();
    }
    /**
     * 获取支持的模型列表
     */
    static getAvailableModels() {
        return AI.getManager().getAvailableModels();
    }
    /**
     * 重置配置
     */
    static resetConfig() {
        return AI.getManager().resetConfig();
    }
}
//# sourceMappingURL=AI.js.map