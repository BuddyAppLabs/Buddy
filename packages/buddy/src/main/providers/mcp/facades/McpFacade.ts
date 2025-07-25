/**
 * MCP 门面
 * 提供静态方法访问 MCP 服务
 */

import { createFacade, Facade } from '@coffic/cosy-framework';
import { IMcpManager } from '../IMcpManager.js';

class BaseFacade extends Facade {
  protected static override getFacadeAccessor(): string {
    return 'mcp';
  }
}

export const McpFacade = createFacade<IMcpManager>(BaseFacade);
