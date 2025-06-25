/**
 * MCP 服务提供者
 * 负责注册 MCP 相关的服务
 */
import { ServiceProvider } from '@coffic/electron-laravel-framework';

export class McpServiceProvider extends ServiceProvider {
    /**
     * 注册 MCP 服务
     */
    public register(): void {
        console.log('🚀 McpServiceProvider register');
    }

    /**
     * 启动 MCP 服务
     */
    public async boot(): Promise<void> {
        // 在这里可以添加启动时的初始化逻辑
        // 比如加载配置、连接服务器等
    }
} 