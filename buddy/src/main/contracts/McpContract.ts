/**
 * MCP 服务接口
 * 定义了 Model Context Protocol 相关的功能
 */
import { Tool, MCPClient } from '../service/mcp/index.js';
import { ServerConfig } from '../service/mcp/config.js';

export interface McpContract {
    /**
     * 连接到 MCP 服务器
     */
    connectToServer(config: ServerConfig): Promise<void>;

    /**
     * 执行指定的工具
     */
    executeTool(toolName: string, args: Record<string, unknown>): Promise<{ content: unknown }>;

    /**
     * 获取可用的工具列表
     */
    getTools(): Tool[];

    /**
     * 清理资源
     */
    cleanup(): Promise<void>;
} 