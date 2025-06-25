/**
 * MCP (Model Control Panel) 契约
 * 定义 MCP 服务的接口
 */

/**
 * MCP 配置
 */
export interface McpConfig {
    /**
     * API 端点
     */
    endpoint: string;

    /**
     * API 密钥
     */
    apiKey?: string;

    /**
     * 超时时间（毫秒）
     */
    timeout?: number;
}

/**
 * MCP 服务契约
 */
export interface McpContract {
    /**
     * 初始化 MCP 服务
     */
    init(config: McpConfig): Promise<void>;

    /**
     * 发送请求到 MCP
     */
    request<T = any>(path: string, options?: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        data?: any;
        headers?: Record<string, string>;
    }): Promise<T>;

    /**
     * 获取当前配置
     */
    getConfig(): McpConfig;

    /**
     * 更新配置
     */
    updateConfig(config: Partial<McpConfig>): void;

    /**
     * 检查服务状态
     */
    checkStatus(): Promise<{
        online: boolean;
        version?: string;
        error?: Error;
    }>;
} 