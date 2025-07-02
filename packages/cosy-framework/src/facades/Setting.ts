import { Facade } from './Facade.js';
import { createFacade } from './createFacade.js';
import type { ISettingManager } from '../contract/setting/ISettingManager.js';

class BaseFacade extends Facade {
  /**
   * Get the registered name of the component.
   */
  protected static getFacadeAccessor(): string {
    return 'setting.manager';
  }
}

export const SettingFacade = createFacade<ISettingManager>(BaseFacade);
