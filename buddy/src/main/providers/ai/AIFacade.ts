import { createFacade, Facade } from '@coffic/cosy-framework';
import { IAIManager } from './IAIManager.js';

class BaseFacade extends Facade {
  protected static override getFacadeAccessor(): string {
    return 'ai';
  }
}

export const AIFacade = createFacade<IAIManager>(BaseFacade);
