import { ILogManager } from '@coffic/cosy-framework';
import { IAIManager } from './IAIManager';

export interface IAIServerConfig {
  port: number;
  logger: ILogManager;
  aiManager: IAIManager;
}
