/**
 * Setting Facade
 * Provides a static interface to the setting manager.
 */
import { SettingAbstract } from '../constants.js';
import { ISettingManager } from '../contract/setting/ISettingManager.js';
import { createFacade } from './createFacade.js';
import { Facade } from './Facade.js';

class BaseFacade extends Facade {
  protected static override getFacadeAccessor(): string {
    return SettingAbstract;
  }
}

export const SettingFacade = createFacade<ISettingManager>(BaseFacade);
