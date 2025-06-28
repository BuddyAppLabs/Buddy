import { Facade, ILogManager } from '@coffic/cosy-framework';

/**
 * Log Facade
 * Provides a static interface to the log manager.
 */
export class LogFacade extends Facade {
  /**
   * Get the registered name of the component.
   */
  protected static getFacadeAccessor(): string {
    return 'log.manager';
  }

  /**
   * Get a specific log channel instance.
   */
  public static channel(name?: string) {
    const instance = this.getFacadeRoot() as ILogManager;
    return instance.channel(name);
  }
}
