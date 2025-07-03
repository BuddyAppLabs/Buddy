/**
 * AI服务提供者
 * 负责注册AI管理器相关的服务
 */
import { ServiceProvider } from '@coffic/cosy-framework';
import { AIManager } from './AIManager.js';
import { AIServer } from './AIServer.js';
import { SERVICE_ABSTRACT_NAME_AI } from '@/main/constants.js';

export class AIServiceProvider extends ServiceProvider {
  /**
   * 注册AI服务
   */
  public register(): void {
    this.app.container().singleton(SERVICE_ABSTRACT_NAME_AI, () => {
      return new AIManager(this.app.make('log'));
    });
  }

  /**
   * 启动AI服务
   */
  public async boot(): Promise<void> {
    // 启动 HTTP 服务
    new AIServer({
      port: 7878,
      logger: this.app.make('log'),
      aiManager: this.app.make(SERVICE_ABSTRACT_NAME_AI),
    }).start();
  }

  /**
   * 关闭AI服务
   */
  public async shutdown(): Promise<void> {}

  /**
   * 获取提供的服务
   */
  public provides(): string[] {
    return [SERVICE_ABSTRACT_NAME_AI];
  }
}
