/**
 * MCP 门面
 * 提供了一个简单的静态接口来访问 MCP 功能
 */
import { BaseFacade } from '@coffic/cosy';
import { McpContract } from '../contracts/McpContract.js';

class McpFacade extends BaseFacade {
    public getFacadeAccessor(): string {
        return 'mcp';
    }
}

export const Mcp = McpFacade; 