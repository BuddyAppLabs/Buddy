import { Facade } from '../../facades/Facade.js';
import { UpdateContract } from '../contracts/UpdateContract.js';

export class Update extends Facade {
  protected static getFacadeAccessor(): string {
    return UpdateContract;
  }
}
