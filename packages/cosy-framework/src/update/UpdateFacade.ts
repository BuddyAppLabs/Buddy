import { Facade } from '../facades/Facade.js';
import { createFacade } from '../facades/createFacade.js';
import { IUpdateManager } from './IUpdateManager.js';

class BaseFacade extends Facade {
  protected static override getFacadeAccessor(): string {
    return 'update';
  }
}

export const UpdateFacade = createFacade<IUpdateManager>(BaseFacade);
