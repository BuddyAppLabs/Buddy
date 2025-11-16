import { IModel } from './IModel';

export enum ProviderType {
  DEEPSEEK = 'deepseek',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}

export interface IProvider {
  type: ProviderType;
  name?: string; // 显示名称
  apiKey: string;
  models: IModel[];
}
