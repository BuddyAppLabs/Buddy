/**
 * MCP 管理器
 * 负责与 MCP 服务的通信和状态管理
 */
import { McpContract, McpConfig } from './contracts/McpContract.js';

export class McpManager implements McpContract {
    /**
     * 当前配置
     */
    private config: McpConfig = {
        endpoint: 'http://localhost:3000'
    };

    /**
     * 是否已初始化
     */
    private initialized = false;

    /**
     * 初始化 MCP 服务
     */
    public async init(config: McpConfig): Promise<void> {
        this.config = {
            ...this.config,
            ...config
        };

        try {
            // 检查服务是否可用
            const status = await this.checkStatus();
            if (!status.online) {
                throw new Error('MCP 服务不可用');
            }

            this.initialized = true;
        } catch (error) {
            console.error('MCP 服务初始化失败:', error);
            throw error;
        }
    }

    /**
     * 发送请求到 MCP
     */
    public async request<T = any>(path: string, options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        data?: any;
        headers?: Record<string, string>;
    } = {}): Promise<T> {
        if (!this.initialized) {
            throw new Error('MCP 服务尚未初始化');
        }

        const { method = 'GET', data, headers = {} } = options;

        // 添加认证头
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        try {
            const response = await fetch(`${this.config.endpoint}${path}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: data ? JSON.stringify(data) : undefined,
                signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('MCP 请求失败:', error);
            throw error;
        }
    }

    /**
     * 获取当前配置
     */
    public getConfig(): McpConfig {
        return { ...this.config };
    }

    /**
     * 更新配置
     */
    public updateConfig(config: Partial<McpConfig>): void {
        this.config = {
            ...this.config,
            ...config
        };
    }

    /**
     * 检查服务状态
     */
    public async checkStatus(): Promise<{
        online: boolean;
        version?: string;
        error?: Error;
    }> {
        try {
            const response = await fetch(`${this.config.endpoint}/status`, {
                signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                online: true,
                version: data.version
            };
        } catch (error) {
            return {
                online: false,
                error: error as Error
            };
        }
    }
} 