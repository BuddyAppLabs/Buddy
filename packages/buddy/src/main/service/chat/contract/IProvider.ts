import { IModel } from './IModel';

export enum ProviderType {
  DEEPSEEK = 'deepseek',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}

export interface IProvider {
  type: ProviderType;
  apiKey: string;
  models: IModel[];
}
