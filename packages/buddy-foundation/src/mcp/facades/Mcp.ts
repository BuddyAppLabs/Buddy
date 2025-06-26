/**
 * MCP 门面
 * 提供静态方法访问 MCP 服务
 */
import { Application } from '@coffic/cosy';

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

} 