/**
 * MCP 服务提供者
 * 负责注册和启动 MCP 服务
 */
import { ServiceProvider } from '@coffic/cosy-framework';
import { McpManager } from './McpManager.js';

export class McpServiceProvider extends ServiceProvider {
    /**
     * 注册 MCP 服务
     */
    public register(): void {
        // 注册 MCP 服务
        this.app.container().singleton('mcp', () => {
            return new McpManager();
        });
    }

    /**
     * 启动 MCP 服务
     */
    public async boot(): Promise<void> {

    }

    /**
     * 获取提供的服务
     */
    public provides(): string[] {
        return ['mcp'];
    }
} 