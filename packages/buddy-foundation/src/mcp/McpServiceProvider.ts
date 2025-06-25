/**
 * MCP 服务提供者
 * 负责注册和启动 MCP 服务
 */
import { ServiceProvider } from '@coffic/cosy';
import { McpManager } from './McpManager.js';
import { McpContract } from './contracts/McpContract.js';

export class McpServiceProvider extends ServiceProvider {
    /**
     * 注册 MCP 服务
     */
    public register(): void {
        console.log('🚀 McpServiceProvider register');

        // 注册 MCP 服务
        this.app.container().singleton('mcp', () => {
            return new McpManager();
        });
    }

    /**
     * 启动 MCP 服务
     */
    public async boot(): Promise<void> {
        const mcpManager = this.app.make<McpContract>('mcp');

        // 从环境变量或配置文件加载配置
        const config = {
            endpoint: process.env.MCP_ENDPOINT || 'http://localhost:3000',
            apiKey: process.env.MCP_API_KEY,
            timeout: process.env.MCP_TIMEOUT ? parseInt(process.env.MCP_TIMEOUT) : 5000
        };

        try {
            // 初始化 MCP 服务
            await mcpManager.init(config);
            console.log('✅ MCP 服务初始化成功');
        } catch (error) {
            console.warn('⚠️ MCP 服务初始化失败，将在需要时重试:', error);
        }
    }

    /**
     * 获取提供的服务
     */
    public provides(): string[] {
        return ['mcp'];
    }
} 