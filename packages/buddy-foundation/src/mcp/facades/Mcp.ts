/**
 * MCP 门面
 * 提供静态方法访问 MCP 服务
 */
import { Application } from '@coffic/cosy';
import { McpContract, McpConfig } from '../contracts/McpContract.js';

export class Mcp {
    /**
     * 应用实例
     */
    private static app: Application;

    /**
     * 设置应用实例
     */
    public static setApp(app: Application): void {
        this.app = app;
    }

    /**
     * 获取 MCP 管理器实例
     */
    private static getManager(): McpContract {
        return this.app.make<McpContract>('mcp');
    }

    /**
     * 初始化 MCP 服务
     */
    public static async init(config: McpConfig): Promise<void> {
        await this.getManager().init(config);
    }

    /**
     * 发送请求到 MCP
     */
    public static async request<T = any>(path: string, options?: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        data?: any;
        headers?: Record<string, string>;
    }): Promise<T> {
        return this.getManager().request<T>(path, options);
    }

    /**
     * 获取当前配置
     */
    public static getConfig(): McpConfig {
        return this.getManager().getConfig();
    }

    /**
     * 更新配置
     */
    public static updateConfig(config: Partial<McpConfig>): void {
        this.getManager().updateConfig(config);
    }

    /**
     * 检查服务状态
     */
    public static async checkStatus(): Promise<{
        online: boolean;
        version?: string;
        error?: Error;
    }> {
        return this.getManager().checkStatus();
    }
} 